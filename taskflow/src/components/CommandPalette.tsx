import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useKanban } from "../features/kanban/useKanban"

interface Props {
  open: boolean
  onClose: () => void
}

interface CommandItem {
  label: string
  action: () => void
}

export default function CommandPalette({ open, onClose }: Props) {

  const navigate = useNavigate()
  const { tasks } = useKanban()

  const [query, setQuery] = useState("")

  /* ESC CLOSE */

  useEffect(() => {

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEsc)

    return () => {
      document.removeEventListener("keydown", handleEsc)
    }

  }, [onClose])

  /* SEARCH RESULTS */

  const results = useMemo(() => {

    const commands: CommandItem[] = [

      { label: "Go to Dashboard", action: () => navigate("/dashboard") },
      { label: "Go to Projects", action: () => navigate("/projects") },
      { label: "Go to Calendar", action: () => navigate("/calendar") },
      { label: "Go to Analytics", action: () => navigate("/analytics") },
      { label: "Go to Settings", action: () => navigate("/settings") },
      { label: "Go to Profile", action: () => navigate("/profile") },

      ...tasks.map(task => ({
        label: `Task: ${task.title}`,
        action: () => navigate("/projects")
      }))

    ]

    if (!query) return commands

    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(query.toLowerCase())
    )

  }, [query, tasks, navigate])

  if (!open) return null

  return (

    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-32 z-50">

      <div className="bg-white dark:bg-neutral-900 w-[600px] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800">

        {/* SEARCH INPUT */}

        <input
          autoFocus
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Search commands..."
          className="
            w-full
            px-4 py-3
            border-b
            border-neutral-200
            dark:border-neutral-800
            bg-transparent
            outline-none
            text-sm
          "
        />

        {/* RESULTS */}

        <div className="max-h-80 overflow-y-auto">

          {results.map((cmd, i) => (

            <button
              key={i}
              onClick={()=>{
                cmd.action()
                onClose()
                setQuery("")
              }}
              className="
                w-full
                text-left
                px-4 py-3
                hover:bg-neutral-100
                dark:hover:bg-neutral-800
                text-sm
                transition
              "
            >
              {cmd.label}
            </button>

          ))}

          {results.length === 0 && (

            <div className="p-4 text-sm text-neutral-400">
              No results found
            </div>

          )}

        </div>

      </div>

    </div>

  )
}
