import { useState } from "react"
import { useIntl } from "react-intl"

export default function Profile() {

  const intl = useIntl()

  const [name,setName] = useState("Sagar")
  const [email,setEmail] = useState("sagar@email.com")
  const [role,setRole] = useState("Frontend Developer")

  return (

    <div className="space-y-8 max-w-xl">

      <div>

        <h1 className="text-2xl font-bold dark:text-white">
          {intl.formatMessage({ id: "profile" })}
        </h1>

        <p className="text-sm text-neutral-500">
          {intl.formatMessage({ id: "manageProfile" })}
        </p>

      </div>

      <div
        className="
        bg-white
        border
        border-neutral-200
        dark:bg-neutral-900
        dark:border-neutral-800
        rounded-xl
        p-6
        space-y-4
      ">

        <div className="flex flex-col gap-1">

          <label className="text-sm text-neutral-500">
            {intl.formatMessage({ id: "name" })}
          </label>

          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            className="border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          />

        </div>

        <div className="flex flex-col gap-1">

          <label className="text-sm text-neutral-500">
            {intl.formatMessage({ id: "email" })}
          </label>

          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          />

        </div>

        <div className="flex flex-col gap-1">

          <label className="text-sm text-neutral-500">
            {intl.formatMessage({ id: "role" })}
          </label>

          <input
            value={role}
            onChange={e=>setRole(e.target.value)}
            className="border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          />

        </div>

        <button
          className="
          bg-indigo-600
          text-white
          px-4
          py-2
          rounded-lg
          hover:bg-indigo-700
        ">
          {intl.formatMessage({ id: "saveChanges" })}
        </button>

      </div>

    </div>

  )
}