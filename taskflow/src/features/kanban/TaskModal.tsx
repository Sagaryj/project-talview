import { useState } from "react"
import type { Priority, TaskStatus } from "./types"

interface Props {
  status: TaskStatus
  onClose: () => void
  onCreate: (
    title: string,
    status: TaskStatus,
    priority: Priority,
    tags: string[],
    dueDate: string,
    description?: string
  ) => void
}

export default function TaskModal({ status, onClose, onCreate }: Props) {
  const [tags, setTags] = useState("")
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = () => {
    if (!title.trim()) return

    const tagsArray = tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)

    onCreate(title, status, priority, tagsArray, dueDate, description)

    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Create Task
        </h2>

        <label className="text-sm text-neutral-500 dark:text-neutral-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />

        <label className="text-sm text-neutral-500 dark:text-neutral-400">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label className="text-sm text-neutral-500 dark:text-neutral-400">Tags</label>
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />

        <label className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />

        <label className="mt-4 block text-sm text-neutral-500 dark:text-neutral-400">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a short task description..."
          className="mt-1 min-h-[96px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-neutral-700 transition hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
