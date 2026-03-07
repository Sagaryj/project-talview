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
    dueDate: string
  ) => void
}

export default function TaskModal({ status, onClose, onCreate }: Props) {
  const [tags, setTags] = useState("")
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState("")

  const handleCreate = () => {
    if (!title.trim()) return

    const tagsArray = tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)

    onCreate(title, status, priority, tagsArray, dueDate)

    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-[420px]"
      >
        <h2 className="text-lg font-semibold mb-4">Create Task</h2>

        <label className="text-sm text-neutral-500">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 mt-1 mb-4"
        />

        <label className="text-sm text-neutral-500">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full border rounded-lg p-2 mt-1 mb-4"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label className="text-sm text-neutral-500">Tags</label>
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
        />

        <label className="text-sm text-neutral-500">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}