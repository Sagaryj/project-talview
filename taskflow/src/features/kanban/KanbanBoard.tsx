import { useState } from "react"

import { useKanban } from "./useKanban"
import KanbanColumn from "./KanbanColumn"
import TaskModal from "./TaskModal"
import type { Task, TaskStatus } from "./types"
import TaskDetailsModal from "./TaskDetailsModal"


export default function KanbanBoard() {
  const { tasks, moveTask, addTask, deleteTask,  
    reorderTask,  updateDescription,
    draggingId, setDraggingId,updateTask,updatePriority, updateDueDate,updateTags } 
    = useKanban()
  const[selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("todo")
    const [search, setSearch] = useState("")
const [filter, setFilter] = useState<
  "all" | "low" | "medium" | "high" | "Tags" | "overdue" | "today"
>("all")
const today = new Date().toISOString().split("T")[0]

const filteredTasks = tasks.filter((task) => {

  if (search) {
    const searchLower = search.toLowerCase()
    const titleMatch= task.title.toLowerCase().includes(searchLower)
    const tagsMatch = task.tags?.some(tag =>
      tag.toLowerCase().includes(searchLower)
    )
    if (!titleMatch && !tagsMatch) return false
  }

  if (filter === "all") return true

  if (filter === "low" || filter === "medium" || filter === "high")
    return task.priority === filter

  if (filter === "today")
    return task.dueDate === today

  if (filter === "overdue")
    return task.dueDate && task.dueDate < today

  return true
})
  return (
  <div className="h-full flex flex-col">

    {/* Search + Filter */}
    <div className="flex items-center gap-3 mb-4">
      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm"
      />

      <select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value as typeof filter)
        }
        className="px-3 py-2 border rounded-lg text-sm"
      >
        <option value="all">All</option>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
        <option value="today">Due Today</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    {/* Add Task Button */}
    <div className="mb-6">
      <button
        onClick={() => {
          setSelectedStatus("todo")
          setModalOpen(true)
        }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
      >
        Hey, Add Task
      </button>
    </div>

    {/* Columns */}
    <div className="flex gap-6 flex-1">
      <KanbanColumn
        title="To Do"
        status="todo"
        tasks={filteredTasks.filter(t => t.status === "todo")}
        moveTask={moveTask}
        onAddTask={(status) => {
          setSelectedStatus(status)
          setModalOpen(true)
        }}
        onDeleteTask={deleteTask}
        reorderTask={reorderTask}
        draggingId={draggingId}
        setDraggingId={setDraggingId}
        updateTask={updateTask}
        setSelectedTask={setSelectedTask}
      />

      <KanbanColumn
        title="In Progress"
        status="in-progress"
        tasks={filteredTasks.filter(t => t.status === "in-progress")}
        moveTask={moveTask}
        onAddTask={(status) => {
          setSelectedStatus(status)
          setModalOpen(true)
        }}
        onDeleteTask={deleteTask}
        draggingId={draggingId}
        setDraggingId={setDraggingId}
        reorderTask={reorderTask}
        updateTask={updateTask}
        setSelectedTask={setSelectedTask}
      />

      <KanbanColumn
        title="Done"
        status="done"
        tasks={filteredTasks.filter(t => t.status === "done")}
        moveTask={moveTask}
        onAddTask={(status) => {
          setSelectedStatus(status)
          setModalOpen(true)
        }}
        onDeleteTask={deleteTask}
        reorderTask={reorderTask}
        draggingId={draggingId}
        setDraggingId={setDraggingId}
        updateTask={updateTask}
        setSelectedTask={setSelectedTask}
      />
    </div>

    {selectedTask && (
      <TaskDetailsModal
  task={selectedTask}
  updateTask={updateTask}
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