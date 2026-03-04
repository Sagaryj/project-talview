import { useEffect, useState } from "react"
import type { Task, TaskStatus, Priority } from "./types"

const initialTasks: Task[] = [
  { id: "1", title: "Design dashboard UI", status: "todo", priority: "high" },
  { id: "2", title: "Setup routing system", status: "in-progress", priority: "medium" },
  { id: "3", title: "Implement dark mode", status: "done", priority: "low" },
]

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(() => {
  const saved = localStorage.getItem("kanban-tasks")
  return saved ? JSON.parse(saved) : initialTasks
})
useEffect(() => {
  localStorage.setItem("kanban-tasks", JSON.stringify(tasks))
}, [tasks])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
  }

const addTask = (title: string, status: TaskStatus, priority: Priority) => {
  setTasks(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      title,
      status,
      priority
    }
  ])
}
  const deleteTask = (taskId: string) => {
  setTasks(prev => prev.filter(task => task.id !== taskId))
}
const reorderTask = (dragId: string, hoverId: string) => {
  setTasks(prev => {
    const dragTask = prev.find(t => t.id === dragId)
    const hoverTask = prev.find(t => t.id === hoverId)

    if (!dragTask || !hoverTask) return prev
    if (dragTask.status !== hoverTask.status) return prev

    const updated = [...prev]

    const dragIndex = updated.findIndex(t => t.id === dragId)
    const hoverIndex = updated.findIndex(t => t.id === hoverId)

    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(hoverIndex, 0, moved)

    return updated
  })
}
const updateTask = (taskId: string, newTitle: string) => {
  setTasks(prev =>
    prev.map(task =>
      task.id === taskId
        ? { ...task, title: newTitle }
        : task
    )
  )
}
  return {
    tasks,
    moveTask,
    addTask,
    deleteTask,
    reorderTask,
    draggingId,
    setDraggingId,
    updateTask
  }
}


