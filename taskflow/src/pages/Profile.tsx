import { useState } from "react"

export default function Profile() {

  const [name,setName] = useState("Sagar")
  const [email,setEmail] = useState("sagar@email.com")
  const [role,setRole] = useState("Frontend Developer")

  return (

    <div className="space-y-8 max-w-xl">

      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          Profile
        </h1>

        <p className="text-sm text-neutral-500">
          Manage your personal information
        </p>
      </div>

      <div className="
        bg-white
        border
        border-neutral-200
        rounded-xl
        p-6
        space-y-4
      ">

        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-500">Name</label>

          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-500">Email</label>

          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-500">Role</label>

          <input
            value={role}
            onChange={e=>setRole(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Save Changes
        </button>

      </div>

    </div>

  )
}