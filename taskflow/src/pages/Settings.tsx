import React, { useEffect, useState } from "react"
import type {ReactNode} from "react"
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
  const saved = localStorage.getItem(PROFILE_KEY)
  if (saved) return JSON.parse(saved)
} catch (error) {
  console.error("Profile parse error", error)
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

      <Section title="Profile">

        <Input label="Full Name" value={profile.name} onChange={(v)=>updateProfile("name",v)} />
        <Input label="Username" value={profile.username} onChange={(v)=>updateProfile("username",v)} />
        <Input label="Email" value={profile.email} onChange={(v)=>updateProfile("email",v)} />
        <Input label="Role" value={profile.role} onChange={(v)=>updateProfile("role",v)} />
        <Input label="Company" value={profile.company} onChange={(v)=>updateProfile("company",v)} />
        <Input label="Timezone" value={profile.timezone} onChange={(v)=>updateProfile("timezone",v)} />

      </Section>

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

      <Section title="Data Management">

        <button
          onClick={exportTasks}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Export Tasks
        </button>

      </Section>

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
  children
}:{title:string,children:ReactNode}){

  return(

    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">

      <h2 className="text-sm font-semibold text-neutral-600 dark:text-white">
        {title}
      </h2>

      {children}

    </div>

  )
}

function Input({
  label,
  value,
  onChange
}:{label:string,value:string,onChange:(v:string)=>void}){

  return(

    <div className="space-y-1">

      <p className="text-sm text-neutral-500">{label}</p>

      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm dark:bg-neutral-800"
      />

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