import { useState } from "react"

import { useKanban } from "./useKanban"
import { useWorkflow } from "./useWorkflow"
import { getDefaultStatusId } from "./workflowConfig"
import KanbanColumn from "./KanbanColumn"
import TaskModal from "./TaskModal"
import type { Task, TaskStatus } from "./types"
import TaskDetailsModal from "./TaskDetailsModal"


export default function KanbanBoard() {
  const { tasks, moveTask, addTask, deleteTask,  
    reorderTask,  updateDescription,
    draggingId, setDraggingId,updateTask,updatePriority, updateDueDate,updateTags } 
    = useKanban()
  const { statuses } = useWorkflow()
  const[selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>(getDefaultStatusId(statuses))
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<
    "all" | "low" | "medium" | "high" | "overdue" | "today"
  >("all")
  const today = new Date().toISOString().split("T")[0]

  const filteredTasks = tasks.filter((task) => {
    if (search) {
      const searchLower = search.toLowerCase()
      const titleMatch = task.title.toLowerCase().includes(searchLower)
      const tagsMatch = task.tags?.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      )

      if (!titleMatch && !tagsMatch) return false
    }

    if (filter === "all") return true

    if (filter === "low" || filter === "medium" || filter === "high") {
      return task.priority === filter
    }

    if (filter === "today") return task.dueDate === today
    if (filter === "overdue") return Boolean(task.dueDate && task.dueDate < today)

    return true
  })

  const defaultStatusId = getDefaultStatusId(statuses)

  return (
  <div className="h-full flex flex-col">

    {/* Search + Filter */}
    <div className="flex items-center gap-3 mb-4">
      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
      />

      <select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value as typeof filter)
        }
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
      >
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="all">All</option>
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="low">Low Priority</option>
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="medium">Medium Priority</option>
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="high">High Priority</option>
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="today">Due Today</option>
        <option className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white" value="overdue">Overdue</option>
      </select>
    </div>

    {/* Add Task Button */}
    <div className="mb-6">
      <button
        onClick={() => {
          setSelectedStatus(defaultStatusId)
          setModalOpen(true)
        }}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
      >
        Add Task
      </button>
    </div>

    {/* Columns */}
    <div className="grid flex-1 gap-6 xl:grid-cols-3" style={{ gridTemplateColumns: `repeat(${statuses.length}, minmax(280px, 1fr))` }}>
      {statuses.map((status) => (
        <KanbanColumn
          key={status.id}
          title={status.label}
          status={status.id}
          accentColor={status.color}
          tasks={filteredTasks.filter((task) => task.status === status.id)}
          moveTask={moveTask}
          onAddTask={(nextStatus) => {
            setSelectedStatus(nextStatus)
            setModalOpen(true)
          }}
          onDeleteTask={deleteTask}
          reorderTask={reorderTask}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          updateTask={updateTask}
          setSelectedTask={setSelectedTask}
        />
      ))}
    </div>

    {selectedTask && (
      <TaskDetailsModal
        task={selectedTask}
        statuses={statuses}
        updateTask={updateTask}
        updateStatus={moveTask}
        updatePriority={updatePriority}
        updateDueDate={updateDueDate}
        updateTags={updateTags}
        onClose={() => setSelectedTask(null)}
        updateDescription={updateDescription}
      />
    )}

    {modalOpen && (
      <TaskModal
        status={selectedStatus}
        onClose={() => setModalOpen(false)}
        onCreate={addTask}
      />
    )}
  </div>
)
}
