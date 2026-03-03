import { useState } from "react"
import { motion } from "framer-motion"
import type { TaskStatus } from "./types"

interface Props {
  status: TaskStatus
  onClose: () => void
  onCreate: (title: string, status: TaskStatus) => void
}

export default function TaskModal({
  status,
  onClose,
  onCreate,
}: Props) {
  const [title, setTitle] = useState("")

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-2xl"
      >
        <h2 className="text-lg font-semibold mb-4">
          Create Task
        </h2>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="
            w-full p-3 rounded-lg
            bg-neutral-100 dark:bg-neutral-800
            outline-none mb-6
          "
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!title.trim()) return
              onCreate(title, status)
              onClose()
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </motion.div>
    </div>
  )
}