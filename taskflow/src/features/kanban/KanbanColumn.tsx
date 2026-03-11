import { motion } from "framer-motion"
import type { Task, TaskStatus } from "./types"
import KanbanCard from "./KanbanCard"
import { useState } from "react"

interface Props {
  title: string
  status: TaskStatus
  tasks: Task[]
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  onAddTask: (status: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
  reorderTask: (dragId: string, hoverId: string) => void
  draggingId: string | null
  setDraggingId: (id: string | null) => void
  updateTask: (taskId: string, newTitle: string) => void
  setSelectedTask: (task: Task) => void
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  moveTask,
  onAddTask,
  onDeleteTask,
  reorderTask,
  setDraggingId,
  updateTask,
  setSelectedTask,
}: Props) {

  const PAGE_SIZE = 5
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE))

  const safePage = Math.min(page, totalPages)

  const start = (safePage - 1) * PAGE_SIZE
  const paginatedTasks = tasks.slice(start, start + PAGE_SIZE)

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const event = e as React.DragEvent<HTMLDivElement>
        const taskId = event.dataTransfer.getData("taskId")
        moveTask(taskId, status)
      }}
      className="
        flex-1 min-h-[400px]
        bg-neutral-100 dark:bg-neutral-900
        rounded-2xl p-4
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase opacity-60">
          {title}
        </h3>

        <button
          onClick={() => onAddTask(status)}
          className="
            text-xs px-2 py-1 rounded-md
            bg-neutral-200 dark:bg-neutral-800
            hover:bg-neutral-300 dark:hover:bg-neutral-700
          "
        >
          + Add
        </button>
      </div>

      {/* Tasks */}
      <motion.div layout className="space-y-3">

        {paginatedTasks.map((task) => (
          <div
            key={task.id}
            onDragOver={(e) => {
              e.preventDefault()

              const dragId = e.dataTransfer.getData("taskId")

              if (dragId && dragId !== task.id) {
                reorderTask(dragId, task.id)
              }
            }}
          >
            <KanbanCard
              task={task}
              onDelete={onDeleteTask}
              setDraggingId={setDraggingId}
              updateTask={updateTask}
              setSelectedTask={setSelectedTask}
            />
          </div>
        ))}

      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-xs">

          <button
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="
              px-2 py-1 border rounded
              disabled:opacity-40
              dark:border-neutral-700
            "
          >
            ◀
          </button>

          <span className="text-neutral-500">
            {safePage} / {totalPages}
          </span>

          <button
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="
              px-2 py-1 border rounded
              disabled:opacity-40
              dark:border-neutral-700
            "
          >
            ▶
          </button>

        </div>
      )}

    </div>
  )
}