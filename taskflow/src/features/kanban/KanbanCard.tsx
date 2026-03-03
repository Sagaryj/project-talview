import { motion } from "framer-motion"
import type { Task } from "./types"

interface Props {
  task: Task
  onDelete: (taskId: string) => void
}

export default function KanbanCard({ task, onDelete }: Props) {
  return (
    <motion.div layout>
      <div
        draggable
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData("taskId", task.id)
        }}
        className="
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          rounded-xl p-4 shadow-sm
          hover:shadow-md transition cursor-grab
        "
      >
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium">
            {task.title}
          </p>

          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-neutral-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  )
}