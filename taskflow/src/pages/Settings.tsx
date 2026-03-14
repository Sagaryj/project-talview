import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Plus, ArrowLeft, ArrowRight, Lock, Trash2, RotateCcw } from "lucide-react"
import { useWorkflow } from "../features/kanban/useWorkflow"
import type { WorkflowCategory } from "../types/workflow"

type Theme = "system" | "light" | "dark"
type Priority = "low" | "medium" | "high"

interface UserProfile {
  name: string
  username: string
  email: string
  role: string
  company: string
  timezone: string
}

interface UserSettings {
  theme: Theme
  compactLayout: boolean
  emailNotifications: boolean
  taskNotifications: boolean
  defaultPriority: Priority
}

const SETTINGS_KEY = "taskflow-settings"
const PROFILE_KEY = "taskflow-profile"

export default function Settings() {
  const { statuses, addStatus, removeStatus, moveStatus, resetStatuses } = useWorkflow()
  const [workflowLabel, setWorkflowLabel] = useState("")
  const [workflowColor, setWorkflowColor] = useState("#0f766e")
  const [workflowCategory, setWorkflowCategory] = useState<WorkflowCategory>("active")

  const [language,setLanguage] = useState(
    localStorage.getItem("app-language") || "en"
  )

  const canResetWorkflow = statuses.some((status) => !status.system)

  const handleChange = (lang:string)=>{
    localStorage.setItem("app-language", lang)
    location.reload()
  }

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (error) {
      console.error("Profile parse error", error)
    }

    return {
      name: "User",
      username: "user123",
      email: "user@email.com",
      role: "Developer",
      company: "TaskFlow",
      timezone: "Asia/Kolkata"
    }
  })

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) return JSON.parse(saved)
    } catch (error) {
      console.error("Settings parse error", error)
    }

    return {
      theme: "system",
      compactLayout: false,
      emailNotifications: true,
      taskNotifications: true,
      defaultPriority: "medium"
    }
  })

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {

    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
      return
    }

    if (settings.theme === "light") {
      document.documentElement.classList.remove("dark")
      return
    }

    const prefersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches

    if (prefersDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

  }, [settings.theme])

  function updateProfile<K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  function updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) {
    setSettings(prev => ({ ...prev, [key]: value }))
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

    localStorage.removeItem("kanban-tasks")
    location.reload()

  }

  function resetSettings() {

    if (!window.confirm("Reset all settings?")) return

    localStorage.removeItem(SETTINGS_KEY)
    localStorage.removeItem(PROFILE_KEY)

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
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Settings
        </h1>

        <p className="text-sm text-neutral-500">
          Manage your application preferences
        </p>
      </div>

      {/* LANGUAGE */}

      <Section title="Language">

        <Select
          label="Application Language"
          value={language}
          onChange={(v)=>{
            setLanguage(v)
            handleChange(v)
          }}
          options={[
            {label:"English",value:"en"},
            {label:"Spanish",value:"es"},
            {label:"French",value:"fr"},
            {label:"German",value:"de"},
            {label:"Hindi",value:"hi"},
            {label:"Japanese",value:"ja"}
          ]}
        />

      </Section>

      {/* PROFILE */}

      <Section title="Profile">

        <Input label="Full Name" value={profile.name} onChange={(v)=>updateProfile("name",v)} />
        <Input label="Username" value={profile.username} onChange={(v)=>updateProfile("username",v)} />
        <Input label="Email" value={profile.email} onChange={(v)=>updateProfile("email",v)} />
        <Input label="Role" value={profile.role} onChange={(v)=>updateProfile("role",v)} />
        <Input label="Company" value={profile.company} onChange={(v)=>updateProfile("company",v)} />
        <Input label="Timezone" value={profile.timezone} onChange={(v)=>updateProfile("timezone",v)} />

      </Section>

      {/* APPEARANCE */}

      <Section title="Appearance">

        <Select
          label="Theme"
          value={settings.theme}
          onChange={(v)=>updateSetting("theme",v as Theme)}
          options={[
            {label:"System",value:"system"},
            {label:"Light",value:"light"},
            {label:"Dark",value:"dark"}
          ]}
        />

        <Toggle
          label="Compact Layout"
          value={settings.compactLayout}
          onChange={(v)=>updateSetting("compactLayout",v)}
        />

      </Section>

      {/* NOTIFICATIONS */}

      <Section title="Notifications">

        <Toggle
          label="Email Notifications"
          value={settings.emailNotifications}
          onChange={(v)=>updateSetting("emailNotifications",v)}
        />

        <Toggle
          label="Task Updates"
          value={settings.taskNotifications}
          onChange={(v)=>updateSetting("taskNotifications",v)}
        />

      </Section>

      {/* TASK DEFAULTS */}

      <Section title="Task Defaults">

        <Select
          label="Default Priority"
          value={settings.defaultPriority}
          onChange={(v)=>updateSetting("defaultPriority",v as Priority)}
          options={[
            {label:"Low",value:"low"},
            {label:"Medium",value:"medium"},
            {label:"High",value:"high"}
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

            <ColorInput
              label="Accent"
              value={workflowColor}
              onChange={setWorkflowColor}
            />

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
                <span
                  className="h-11 w-11 rounded-2xl shadow-inner"
                  style={{ backgroundColor: status.color }}
                />

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {status.label}
                    </h3>
                    <StageBadge category={status.category} />
                    {status.system && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">
                        <Lock size={12} />
                        Core
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    ID: {status.id}
                  </p>
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

      {/* DATA MANAGEMENT */}

      <Section title="Data Management">

        <button
          onClick={exportTasks}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Export Tasks
        </button>

      </Section>

      {/* DANGER ZONE */}

      <Section title="Danger Zone">

        <div className="flex gap-4">

          <button
            onClick={clearTasks}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Delete All Tasks
          </button>

          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-neutral-600 text-white rounded-lg"
          >
            Reset Settings
          </button>

        </div>

      </Section>

    </div>

  )
}

/* ---------- UI COMPONENTS ---------- */

function Section({
  title,
  description,
  children
}:{
  title:string
  description?: string
  children:ReactNode
}){

  return(

    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">

      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
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
  placeholder
}:{
  label:string
  value:string
  onChange:(v:string)=>void
  placeholder?: string
}){

  return(

    <div className="space-y-1">

      <p className="text-sm text-neutral-500">{label}</p>

      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm dark:bg-neutral-800"
      />

    </div>

  )
}

function ColorInput({
  label,
  value,
  onChange
}:{
  label:string
  value:string
  onChange:(v:string)=>void
}){

  return(

    <div className="space-y-1">

      <p className="text-sm text-neutral-500">{label}</p>

      <label className="flex h-[42px] items-center gap-3 rounded-lg border border-neutral-300 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-800">
        <input
          type="color"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          className="h-7 w-7 rounded border-0 bg-transparent p-0"
        />

        <span className="text-sm text-neutral-600 dark:text-neutral-200">
          {value.toUpperCase()}
        </span>
      </label>

    </div>

  )
}

function Select({
  label,
  value,
  onChange,
  options
}:{label:string,value:string,onChange:(v:string)=>void,
options:{label:string,value:string}[]}){

  return(

    <div className="space-y-1">

      <p className="text-sm text-neutral-500">{label}</p>

      <select
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm dark:bg-neutral-800"
      >

        {options.map(o=>(
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
}:{label:string,value:boolean,onChange:(v:boolean)=>void}){

  return(

    <div className="flex justify-between items-center">

      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        {label}
      </span>

      <button
        onClick={()=>onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition ${value ? "bg-indigo-600":"bg-neutral-300"}`}
      >

        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${value ? "translate-x-5":""}`}
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
