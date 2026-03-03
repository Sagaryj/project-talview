import { motion } from "framer-motion"
import type { Task, TaskStatus } from "./types"
import KanbanCard from "./KanbanCard"

interface Props {
  title: string
  status: TaskStatus
  tasks: Task[]
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  onAddTask: (status: TaskStatus) => void
  onDeleteTask:(taskId:string) => void
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  moveTask,
  onAddTask,
  onDeleteTask
}: Props) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const event = e as unknown as React.DragEvent<HTMLDivElement>
        const taskId = event.dataTransfer.getData("taskId")
        moveTask(taskId, status)
      }}
      className="
        flex-1 min-h-[400px]
        bg-neutral-100 dark:bg-neutral-900
        rounded-2xl p-4
        transition-colors
      "
    >
      <div className="flex items-center justify-between mb-4">
  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
    {title}
  </h3>

  <button
    onClick={() => onAddTask(status)}
    className="text-xs px-2 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
  >
    + Add
  </button>
</div>

      <motion.div layout className="space-y-3">
        {tasks.map(task => (
          <KanbanCard 
          key={task.id}
           task={task}
           onDelete={onDeleteTask} />
        ))}
      </motion.div>
    </div>
  )
}