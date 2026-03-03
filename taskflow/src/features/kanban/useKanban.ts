import { useState } from "react"
import type { Task, TaskStatus } from "./types"

const initialTasks: Task[] = [
  { id: "1", title: "Design dashboard UI", status: "todo" },
  { id: "2", title: "Setup routing system", status: "in-progress" },
  { id: "3", title: "Implement dark mode", status: "done" },
]

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
  }

  const addTask = (title: string, status: TaskStatus) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status,
    }

    setTasks(prev => [...prev, newTask])
  }
  const deleteTask = (taskId: string) => {
  setTasks(prev => prev.filter(task => task.id !== taskId))
}

  return {
    tasks,
    moveTask,
    addTask,
    deleteTask,
  }
}
