import { useState } from "react"
import type { Task, Priority } from "./types"

interface Props {
  task: Task
  updateTask: (taskId: string, newTitle: string) => void
  updatePriority: (taskId: string, priority: Priority) => void
  onClose: () => void
  updateDueDate: (taskId: string, dueDate: string) => void
  updateTags: (taskId: string, tags: string[]) => void
  updateDescription: (taskId: string, description: string) => void
}

export default function TaskDetailsModal({
  task,
  updateTask,
  updatePriority,
  updateDueDate,
  onClose,
  updateTags,
  updateDescription
}: Props) {
  const [description, setDescription] = useState(task.description ?? "")
  const [dueDate, setDueDate] = useState(task.dueDate ?? "")
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [tags, setTags] = useState(task.tags?.join(", ") || "")
const handleSave = () => {

  updateTask(task.id, title)

  updatePriority(task.id, priority)

  updateDueDate(task.id, dueDate)

  const tagsArray = tags
    .split(",")
    .map(t => t.trim())
    .filter(Boolean)

  updateTags(task.id, tagsArray)
  updateDescription(task.id, description)

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
        <h2 className="text-lg font-semibold mb-4">Task Details</h2>

        {/* Title */}
        <label className="text-sm text-neutral-500">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 mt-1 mb-4"
        />

        {/* Priority */}
        <label className="text-sm text-neutral-500">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full border rounded-lg p-2 mt-1"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {/* Due Date */}
        <label className="text-sm text-neutral-500">Tags</label>

<input
  value={tags}
  onChange={(e) => setTags(e.target.value)}
  placeholder="frontend, bug, api"
  className="w-full border rounded-lg p-2 mt-1 mb-4"
/>
<label className="text-sm text-neutral-500">Due Date</label>
<input
  type="date"
  value={dueDate}
  onChange={(e) => setDueDate(e.target.value)}
  className="w-full border rounded-lg p-2 mt-1 mb-4"
/>
<label className="text-sm text-neutral-500">
  Description
</label>

<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Add task description..."
  className="
    w-full
    border
    rounded-lg
    p-2
    mt-1
    mb-4
    min-h-[80px]
  "
/>
        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}