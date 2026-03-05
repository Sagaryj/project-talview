import { motion } from "framer-motion"
import type { Task, Priority } from "./types"
import { useState } from "react"

interface Props {
  task: Task
  onDelete: (taskId: string) => void
  setDraggingId: (id: string | null) => void
  updateTask: (taskId: string, newTitle: string) => void
  setSelectedTask: (task: Task) => void
}

export default function KanbanCard({
  task,
  onDelete,
  setDraggingId,
  updateTask,
  setSelectedTask
}: Props) {
 const isOverdue =
  task.dueDate &&
  new Date(task.dueDate) < new Date(new Date().toDateString())

  const priorityColor: Record<Priority, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500"
  }

  const priorityBorder: Record<Priority, string> = {
    low: "border-l-green-500",
    medium: "border-l-yellow-500",
    high: "border-l-red-500"
  }

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(task.title)

  return (
    <motion.div layout>
      <div
        draggable
        onClick={() => setSelectedTask(task)}
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData("taskId", task.id)
          setDraggingId(task.id)
        }}
        className={`
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          border-l-4 ${priorityBorder[task.priority]}
          rounded-xl p-4 shadow-sm
          hover:shadow-md transition cursor-grab
        `}
      >
        {task.dueDate && (
  <div 
  className={`text-xs mt-2 ${
  isOverdue ? "text-red-500" : "text-neutral-400"}`}>
    Due: {task.dueDate}
    {isOverdue && " • OVERDUE"}
  </div>
)}
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full text-white ${priorityColor[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Title / Edit Input */}
        <div className="flex justify-between items-start gap-2">

          {editing ? (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => {
                updateTask(task.id, value)
                setEditing(false)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateTask(task.id, value)
                  setEditing(false)
                }
              }}
              className="
                w-full text-sm bg-transparent
                outline-none border-b border-neutral-400
              "
            />
          ) : (
            <p
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
              className="text-sm font-medium cursor-text"
            >
              {task.title}
            </p>
          )}

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-xs text-neutral-400 hover:text-red-500 transition"
          >
            ✕
          </button>

        </div>

      </div>
    </motion.div>
  )
}