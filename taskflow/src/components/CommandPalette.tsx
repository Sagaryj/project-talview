import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

interface CommandPaletteProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function CommandPalette({
  open,
  setOpen,
}: CommandPaletteProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setOpen])

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl p-4"
      >
        <input
          autoFocus
          placeholder="Search..."
          className="w-full bg-transparent outline-none text-neutral-900 dark:text-white"
        />
      </div>
    </div>
  )
}