import { useEffect, useRef, useState } from "react"
import type { Task, TaskStatus, Priority } from "./types"
import type { Activity } from "../../types/Activity"
import { getWorkflowStatuses, sanitizeTasksForWorkflow } from "./workflowConfig"


const initialTasks: Task[] = [
  { id: "1", title: "Design dashboard UI", status: "todo", priority: "high" },
  { id: "2", title: "Setup routing system", status: "in-progress", priority: "medium" },
  { id: "3", title: "Implement dark mode", status: "done", priority: "low" },
]

export function useKanban() {
  const instanceId = useRef(crypto.randomUUID())
  const skipBroadcastRef = useRef(false)

  /* ---------------- TASK STATE ---------------- */

  const [tasks, setTasks] = useState<Task[]>(() => {
    const workflowStatuses = getWorkflowStatuses()

    try {
      const saved = localStorage.getItem("kanban-tasks")
      const parsedTasks = saved ? JSON.parse(saved) : initialTasks

      return sanitizeTasksForWorkflow(parsedTasks, workflowStatuses)
    } catch {
      return sanitizeTasksForWorkflow(initialTasks, workflowStatuses)
    }
  })
  const lastTasksSerializedRef = useRef<string | null>(null)

  /* ---------------- ACTIVITY STATE ---------------- */

  const [activity, setActivity] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("kanban-activity")
    return saved ? JSON.parse(saved) : []
  })

  /* ---------------- PERSISTENCE ---------------- */

  useEffect(() => {
    const serialized = JSON.stringify(tasks)

    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false
      lastTasksSerializedRef.current = serialized
      return
    }

    if (serialized === lastTasksSerializedRef.current) {
      return
    }

    localStorage.setItem("kanban-tasks", serialized)
    lastTasksSerializedRef.current = serialized
    window.dispatchEvent(
      new CustomEvent("taskflow:tasks-updated", {
        detail: { sourceId: instanceId.current }
      })
    )
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("kanban-activity", JSON.stringify(activity))
  }, [activity])

  useEffect(() => {
    function syncTasks() {
      const workflowStatuses = getWorkflowStatuses()

      try {
        const saved = localStorage.getItem("kanban-tasks")
        const parsedTasks = saved ? JSON.parse(saved) : initialTasks
        const nextTasks = sanitizeTasksForWorkflow(parsedTasks, workflowStatuses)
        const serialized = JSON.stringify(nextTasks)

        if (serialized === lastTasksSerializedRef.current) {
          return
        }

        skipBroadcastRef.current = true
        setTasks(nextTasks)
      } catch {
        const nextTasks = sanitizeTasksForWorkflow(initialTasks, workflowStatuses)
        const serialized = JSON.stringify(nextTasks)

        if (serialized === lastTasksSerializedRef.current) {
          return
        }

        skipBroadcastRef.current = true
        setTasks(nextTasks)
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "kanban-tasks" || event.key === "workflow-statuses") {
        syncTasks()
      }
    }

    function handleTaskSync(event: Event) {
      const sourceId = (event as CustomEvent<{ sourceId?: string }>).detail?.sourceId
      if (sourceId === instanceId.current) return
      syncTasks()
    }

    window.addEventListener("taskflow:tasks-updated", handleTaskSync)
    window.addEventListener("taskflow:workflow-updated", syncTasks)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("taskflow:tasks-updated", handleTaskSync)
      window.removeEventListener("taskflow:workflow-updated", syncTasks)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  /* ---------------- DRAG STATE ---------------- */

  const [draggingId, setDraggingId] = useState<string | null>(null)

  /* ---------------- ACTIVITY LOGGER ---------------- */

  const logActivity = (message: string) => {

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      message,
      timestamp: Date.now()
    }

    setActivity(prev => [newActivity, ...prev])
  }

  /* ---------------- TASK ACTIONS ---------------- */

  const moveTask = (taskId: string, newStatus: TaskStatus) => {

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    )

    logActivity(`Task moved to ${newStatus}`)
  }

  const addTask = (
    title: string,
    status: TaskStatus,
    priority: Priority,
    tags: string[],
    dueDate: string,
    description?: string
  ) => {

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status,
      priority,
      tags,
      dueDate,
      description
    }

    setTasks(prev => [...prev, newTask])

    logActivity(`Task "${title}" created`)
  }
  const updateDescription = (taskId: string, description: string) => {
  setTasks(prev =>
    prev.map(task =>
      task.id === taskId
        ? { ...task, description }
        : task
    )
  )
}
  const deleteTask = (taskId: string) => {

    const task = tasks.find(t => t.id === taskId)

    setTasks(prev => prev.filter(task => task.id !== taskId))

    if (task) {
      logActivity(`Task "${task.title}" deleted`)
    }
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

    logActivity("Tasks reordered")
  }

  const updateTask = (taskId: string, newTitle: string) => {

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, title: newTitle }
          : task
      )
    )

    logActivity(`Task title updated`)
  }

  const updateDueDate = (taskId: string, dueDate: string) => {

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, dueDate }
          : task
      )
    )

    logActivity(`Due date updated`)
  }

  const updatePriority = (taskId: string, priority: Priority) => {

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, priority }
          : task
      )
    )

    logActivity(`Priority changed to ${priority}`)
  }

  const updateTags = (taskId: string, tags: string[]) => {

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, tags }
          : task
      )
    )

    logActivity(`Tags updated`)
  }

  /* ---------------- RETURN ---------------- */

  return {
    tasks,
    activity,
    moveTask,
    addTask,
    deleteTask,
    reorderTask,
    draggingId,
    setDraggingId,
    updateTask,
    updateDueDate,
    updatePriority,
    updateTags,
    updateDescription
  }
}
