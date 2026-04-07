import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Plus, ArrowLeft, ArrowRight, Lock, Trash2, RotateCcw } from "lucide-react"
import { useIntl } from "react-intl"
import { useWorkflow } from "../features/kanban/useWorkflow"
import { fetchCurrentUser, getAuthSession, updateCurrentUserProfile } from "../lib/auth"
import type { WorkflowCategory } from "../types/workflow"
import { getAvailableTimezones, normalizeTimezone } from "../lib/timezone"

type Theme = "system" | "light" | "dark"
type Priority = "low" | "medium" | "high"

interface UserProfile {
  name: string
  username: string
  email: string
  profileRole: string
  company: string
  timezone: string
}

interface UserSettings {
  theme: Theme
  emailNotifications: boolean
  defaultPriority: Priority
}

const SETTINGS_KEY = "taskflow-settings"

function normalizeTheme(value?: string): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system"
}

function getDefaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

export default function Settings() {
  const intl = useIntl()
  const { statuses, addStatus, removeStatus, moveStatus, resetStatuses } = useWorkflow()
  const [workflowLabel, setWorkflowLabel] = useState("")
  const [workflowColor, setWorkflowColor] = useState("#0f766e")
  const [workflowCategory, setWorkflowCategory] = useState<WorkflowCategory>("active")

  const session = getAuthSession()
  const [language, setLanguage] = useState(
    session?.user.preferredLanguage ?? localStorage.getItem("app-language") ?? "en"
  )
  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user.name ?? "",
    username: session?.user.username ?? "",
    email: session?.user.email ?? "",
    profileRole: session?.user.profileRole ?? "Member",
    company: session?.user.company ?? "",
    timezone: normalizeTimezone(session?.user.timezone ?? getDefaultTimezone())
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [profileError, setProfileError] = useState("")

  const canResetWorkflow = statuses.some((status) => !status.system)
  const timezoneOptions = getAvailableTimezones()

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as UserSettings
        return {
          ...parsed,
          theme: normalizeTheme(parsed.theme)
        }
      }
    } catch (error) {
      console.error("Settings parse error", error)
    }

    return {
      theme: normalizeTheme(session?.user.theme),
      emailNotifications: session?.user.emailNotifications ?? true,
      defaultPriority: "medium"
    }
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const user = await fetchCurrentUser()
        if (cancelled) return

        setProfile({
          name: user.name,
          username: user.username ?? "",
          email: user.email,
          profileRole: user.profileRole ?? "Member",
          company: user.company ?? "",
          timezone: normalizeTimezone(user.timezone ?? getDefaultTimezone())
        })
        setLanguage(user.preferredLanguage ?? localStorage.getItem("app-language") ?? "en")
        setSettings((prev) => ({
          ...prev,
          theme: normalizeTheme(user.theme),
          emailNotifications: user.emailNotifications ?? true
        }))
      } catch {
        if (!cancelled) {
          setProfileError(intl.formatMessage({ id: "profileLoadFailed" }))
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [intl])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
      return
    }

    if (settings.theme === "light") {
      document.documentElement.classList.remove("dark")
      return
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (prefersDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.theme])

  function updateProfile<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setProfileMessage("")
    setProfileError("")
  }

  function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (key === "theme") {
      setProfileMessage("")
    }
  }

  async function saveProfileChanges() {
    const nextName = profile.name.trim()
    if (!nextName) {
      setProfileError(intl.formatMessage({ id: "profileNameRequired" }))
      return
    }

    const previousLanguage = localStorage.getItem("app-language") ?? "en"

    setProfileSaving(true)
    setProfileError("")
    setProfileMessage("")

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: nextName,
        username: profile.username,
        preferredLanguage: language,
        theme: settings.theme,
        profileRole: profile.profileRole.trim() || "Member",
        company: profile.company.trim(),
        timezone: normalizeTimezone(profile.timezone),
        emailNotifications: settings.emailNotifications
      })

      const nextLanguage = updatedUser.preferredLanguage ?? language

      setProfile({
        name: updatedUser.name,
        username: updatedUser.username ?? "",
        email: updatedUser.email,
        profileRole: updatedUser.profileRole ?? "Member",
        company: updatedUser.company ?? "",
        timezone: normalizeTimezone(updatedUser.timezone ?? profile.timezone)
      })
      setLanguage(nextLanguage)
      setSettings((prev) => ({
        ...prev,
        theme: normalizeTheme(updatedUser.theme)
      }))
      localStorage.setItem("app-language", nextLanguage)
      setProfileMessage(intl.formatMessage({ id: "profileSaved" }))

      if (nextLanguage !== previousLanguage) {
        window.location.reload()
      }
    } catch (error) {
      if (error instanceof Error && error.message === "PROFILE_USERNAME_TAKEN") {
        setProfileError(intl.formatMessage({ id: "usernameTaken" }))
      } else {
        setProfileError(intl.formatMessage({ id: "profileSaveFailed" }))
      }
    } finally {
      setProfileSaving(false)
    }
  }

  function exportTasks() {
    const data = localStorage.getItem("kanban-tasks")
    if (!data) return

    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "taskflow-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearTasks() {
    if (!window.confirm("Delete all tasks permanently?")) return

    localStorage.setItem("kanban-tasks", JSON.stringify([]))
    localStorage.setItem("kanban-activity", JSON.stringify([]))
    location.reload()
  }

  function resetSettings() {
    if (!window.confirm("Reset local settings?")) return

    localStorage.removeItem(SETTINGS_KEY)
    localStorage.removeItem("app-language")
    location.reload()
  }

  function handleAddWorkflowStatus() {
    const trimmedLabel = workflowLabel.trim()
    if (!trimmedLabel) return

    addStatus(trimmedLabel, workflowColor, workflowCategory)
    setWorkflowLabel("")
    setWorkflowColor("#0f766e")
    setWorkflowCategory("active")
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">{intl.formatMessage({ id: "settings" })}</h1>
        <p className="text-sm text-neutral-500">{intl.formatMessage({ id: "manageProfile" })}</p>
      </div>

      <Section title={intl.formatMessage({ id: "profile" })} description="These fields are synced with the database and shared with the Profile page.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={intl.formatMessage({ id: "name" })} value={profile.name} onChange={(v) => updateProfile("name", v)} />
          <Input label={intl.formatMessage({ id: "username" })} value={profile.username} onChange={(v) => updateProfile("username", v)} />
          <Input label={intl.formatMessage({ id: "email" })} value={profile.email} onChange={() => undefined} readOnly />
          <Input label={intl.formatMessage({ id: "role" })} value={profile.profileRole} onChange={(v) => updateProfile("profileRole", v)} />
          <Input label={intl.formatMessage({ id: "company" })} value={profile.company} onChange={(v) => updateProfile("company", v)} />
          <Select
            label={intl.formatMessage({ id: "timezone" })}
            value={profile.timezone}
            onChange={(value) => updateProfile("timezone", value)}
            options={timezoneOptions.map((timezone) => ({ label: timezone, value: timezone }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label={intl.formatMessage({ id: "preferredLanguage" })}
            value={language}
            onChange={setLanguage}
            options={[
              { label: "English", value: "en" },
              { label: "Spanish", value: "es" },
              { label: "French", value: "fr" },
              { label: "German", value: "de" },
              { label: "Hindi", value: "hi" },
              { label: "Japanese", value: "ja" }
            ]}
          />

          <Select
            label="Theme"
            value={settings.theme}
            onChange={(value) => updateSetting("theme", value as Theme)}
            options={[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" }
            ]}
          />
        </div>

        {profileError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {profileError}
          </p>
        )}

        {profileMessage && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {profileMessage}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={saveProfileChanges}
            disabled={profileLoading || profileSaving}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {profileSaving
              ? intl.formatMessage({ id: "profileSaving" })
              : intl.formatMessage({ id: "profileSaveButton" })}
          </button>
        </div>
      </Section>


      <Section title="Notifications">
        <Toggle
          label="Email Notifications"
          value={settings.emailNotifications}
          onChange={(v) => updateSetting("emailNotifications", v)}
        />
      </Section>

      <Section title="Task Defaults">
        <Select
          label="Default Priority"
          value={settings.defaultPriority}
          onChange={(v) => updateSetting("defaultPriority", v as Priority)}
          options={[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" }
          ]}
        />
      </Section>

      <Section
        title="Workflow Stages"
        description="Manage the stages used across boards, analytics, dashboard summaries, and task editing."
      >
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-950/70">
          <div className="grid gap-4 md:grid-cols-[1.2fr_140px_160px_auto]">
            <Input
              label="Stage Name"
              value={workflowLabel}
              onChange={setWorkflowLabel}
              placeholder="Blocked, Review, QA..."
            />

            <ColorInput label="Accent" value={workflowColor} onChange={setWorkflowColor} />

            <Select
              label="Category"
              value={workflowCategory}
              onChange={(value) => setWorkflowCategory(value as WorkflowCategory)}
              options={[
                { label: "Pending", value: "pending" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" }
              ]}
            />

            <div className="flex items-end">
              <button
                onClick={handleAddWorkflowStatus}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Plus size={16} />
                Add Stage
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {statuses.map((status, index) => (
            <div
              key={status.id}
              className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/60 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="h-11 w-11 rounded-2xl shadow-inner" style={{ backgroundColor: status.color }} />

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{status.label}</h3>
                    <StageBadge category={status.category} />
                    {status.system && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">
                        <Lock size={12} />
                        Core
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">ID: {status.id}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => moveStatus(status.id, "left")}
                  disabled={index === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  <ArrowLeft size={15} />
                  Move Left
                </button>

                <button
                  onClick={() => moveStatus(status.id, "right")}
                  disabled={index === statuses.length - 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  <ArrowRight size={15} />
                  Move Right
                </button>

                <button
                  onClick={() => removeStatus(status.id)}
                  disabled={status.system || statuses.length === 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={resetStatuses}
            disabled={!canResetWorkflow}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            <RotateCcw size={15} />
            Reset Workflow
          </button>
        </div>
      </Section>

      <Section title="Data Management">
        <button onClick={exportTasks} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Export Tasks
        </button>
      </Section>

      <Section title="Danger Zone">
        <div className="flex gap-4">
          <button onClick={clearTasks} className="px-4 py-2 bg-red-500 text-white rounded-lg">
            Delete All Tasks
          </button>

          <button onClick={resetSettings} className="px-4 py-2 bg-neutral-600 text-white rounded-lg">
            Reset Settings
          </button>
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-white">{title}</h2>

        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>

      {children}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">{label}</p>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 ${
          readOnly ? "bg-neutral-50 text-neutral-500 dark:text-neutral-300" : ""
        }`}
      />
    </div>
  )
}

function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">{label}</p>

      <label className="flex h-[42px] items-center gap-3 rounded-lg border border-neutral-300 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-800">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 rounded border-0 bg-transparent p-0"
        />

        <span className="text-sm text-neutral-600 dark:text-neutral-200">{value.toUpperCase()}</span>
      </label>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">{label}</p>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm dark:bg-neutral-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition ${value ? "bg-indigo-600" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${value ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  )
}

function StageBadge({ category }: { category: WorkflowCategory }) {
  const styles: Record<WorkflowCategory, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    active: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
  }

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[category]}`}>
      {category}
    </span>
  )
}
