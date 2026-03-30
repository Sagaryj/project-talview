import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useIntl } from "react-intl"
import { fetchCurrentUser, getAuthSession, updateCurrentUserProfile } from "../lib/auth"
import { getAvailableTimezones, normalizeTimezone } from "../lib/timezone"

type ThemeOption = "system" | "light" | "dark"

interface ProfileFormState {
  name: string
  username: string
  email: string
  profileRole: string
  company: string
  timezone: string
  preferredLanguage: string
  theme: ThemeOption
}

function normalizeTheme(value?: string): ThemeOption {
  return value === "light" || value === "dark" || value === "system" ? value : "system"
}

function normalizeProfileState() {
  const session = getAuthSession()

  return {
    name: session?.user.name ?? "",
    username: session?.user.username ?? "",
    email: session?.user.email ?? "",
    profileRole: session?.user.profileRole ?? "Member",
    company: session?.user.company ?? "",
    timezone: normalizeTimezone(session?.user.timezone),
    preferredLanguage:
      session?.user.preferredLanguage ?? localStorage.getItem("app-language") ?? "en",
    theme: normalizeTheme(session?.user.theme)
  } satisfies ProfileFormState
}

export default function Profile() {
  const intl = useIntl()
  const timezones = getAvailableTimezones()
  const [form, setForm] = useState<ProfileFormState>(() => normalizeProfileState())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const user = await fetchCurrentUser()
        if (cancelled) return

        setForm({
          name: user.name,
          username: user.username ?? "",
          email: user.email,
          profileRole: user.profileRole ?? "Member",
          company: user.company ?? "",
          timezone: normalizeTimezone(user.timezone),
          preferredLanguage: user.preferredLanguage ?? localStorage.getItem("app-language") ?? "en",
          theme: normalizeTheme(user.theme)
        })
      } catch {
        if (!cancelled) {
          setError(intl.formatMessage({ id: "profileLoadFailed" }))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [intl])

  function updateField<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError("")
    setSuccess("")
  }

  async function handleSave() {
    const nextName = form.name.trim()
    if (!nextName) {
      setError(intl.formatMessage({ id: "profileNameRequired" }))
      return
    }

    const previousLanguage = localStorage.getItem("app-language") ?? "en"

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: nextName,
        username: form.username,
        preferredLanguage: form.preferredLanguage,
        theme: form.theme,
        profileRole: form.profileRole.trim() || "Member",
        company: form.company.trim(),
        timezone: normalizeTimezone(form.timezone)
      })

      const nextLanguage = updatedUser.preferredLanguage ?? form.preferredLanguage

      setForm({
        name: updatedUser.name,
        username: updatedUser.username ?? "",
        email: updatedUser.email,
        profileRole: updatedUser.profileRole ?? "Member",
        company: updatedUser.company ?? "",
        timezone: normalizeTimezone(updatedUser.timezone ?? form.timezone),
        preferredLanguage: nextLanguage,
        theme: normalizeTheme(updatedUser.theme)
      })
      localStorage.setItem("app-language", nextLanguage)
      setSuccess(intl.formatMessage({ id: "profileSaved" }))

      if (nextLanguage !== previousLanguage) {
        window.location.reload()
      }
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message === "PROFILE_USERNAME_TAKEN") {
        setError(intl.formatMessage({ id: "usernameTaken" }))
      } else {
        setError(intl.formatMessage({ id: "profileSaveFailed" }))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          {intl.formatMessage({ id: "profile" })}
        </h1>

        <p className="text-sm text-neutral-500">
          {intl.formatMessage({ id: "manageProfile" })}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={intl.formatMessage({ id: "name" })}>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </Field>

          <Field label={intl.formatMessage({ id: "username" })}>
            <input
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </Field>

          <Field label={intl.formatMessage({ id: "email" })}>
            <input
              value={form.email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            />
          </Field>

          <Field label={intl.formatMessage({ id: "role" })}>
            <input
              value={form.profileRole}
              onChange={(event) => updateField("profileRole", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </Field>

          <Field label={intl.formatMessage({ id: "company" })}>
            <input
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </Field>

          <Field label={intl.formatMessage({ id: "timezone" })}>
            <select
              value={form.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              {timezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
          </Field>

          <Field label={intl.formatMessage({ id: "preferredLanguage" })}>
            <select
              value={form.preferredLanguage}
              onChange={(event) => updateField("preferredLanguage", event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="ja">Japanese</option>
            </select>
          </Field>

          <Field label="Theme">
            <select
              value={form.theme}
              onChange={(event) => updateField("theme", event.target.value as ThemeOption)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {success}
          </p>
        )}

        <button
          disabled={loading || saving}
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? intl.formatMessage({ id: "profileSaving" })
            : intl.formatMessage({ id: "profileSaveButton" })}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      {children}
    </label>
  )
}
