import { useState } from "react"
import type { Task, Priority } from "./types"
import type { WorkflowStatus } from "../../types/workflow"

interface Props {
  task: Task
  statuses: WorkflowStatus[]
  updateTask: (taskId: string, newTitle: string) => void
  updateStatus: (taskId: string, status: string) => void
  updatePriority: (taskId: string, priority: Priority) => void
  onClose: () => void
  updateDueDate: (taskId: string, dueDate: string) => void
  updateTags: (taskId: string, tags: string[]) => void
  updateDescription: (taskId: string, description: string) => void
}

export default function TaskDetailsModal({
  task,
  statuses,
  updateTask,
  updateStatus,
  updatePriority,
  updateDueDate,
  onClose,
  updateTags,
  updateDescription
}: Props) {
  const [description, setDescription] = useState(task.description ?? "")
  const [dueDate, setDueDate] = useState(task.dueDate ?? "")
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [tags, setTags] = useState(task.tags?.join(", ") || "")
const handleSave = () => {

  updateTask(task.id, title)
  updateStatus(task.id, status)
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
        className="w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Task Details
        </h2>

        {/* Title */}
        <label className="text-sm text-neutral-500 dark:text-neutral-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />

        {/* Priority */}
        <label className="text-sm text-neutral-500 dark:text-neutral-400">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          {statuses.map((workflowStatus) => (
            <option key={workflowStatus.id} value={workflowStatus.id}>
              {workflowStatus.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <label className="text-sm text-neutral-500 dark:text-neutral-400">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {/* Due Date */}
        <label className="text-sm text-neutral-500 dark:text-neutral-400">Tags</label>

<input
  value={tags}
  onChange={(e) => setTags(e.target.value)}
  placeholder="frontend, bug, api"
  className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
/>
<label className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</label>
<input
  type="date"
  value={dueDate}
  onChange={(e) => setDueDate(e.target.value)}
  className="mt-1 mb-4 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
/>
<label className="text-sm text-neutral-500 dark:text-neutral-400">
  Description
</label>

<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Add task description..."
  className="
    w-full
    rounded-xl
    border border-neutral-300
    bg-white
    px-3
    py-2
    mt-1
    mb-4
    min-h-[80px]
    text-sm
    text-neutral-900
    outline-none
    transition
    focus:border-indigo-500
    focus:ring-2
    focus:ring-indigo-500/20
    dark:border-neutral-700
    dark:bg-neutral-800
    dark:text-white
    dark:placeholder:text-neutral-500
  "
/>
        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-neutral-700 transition hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
