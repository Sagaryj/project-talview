import { useEffect, useState } from "react"
import type { Activity } from "../../types/activity"
import {
  createActivity,
  createTask,
  deleteTask as deleteTaskById,
  fetchActivities,
  fetchTasks,
  fetchWorkflowStatuses,
  moveTaskWithActivityLog as moveTaskWithActivityLogAction,
  reorderTasks as reorderTasksInHasura,
  replaceTaskTags,
  subscribeToActivities,
  subscribeToTasks,
  updateTaskFields
} from "./hasura"
import type { Priority, Task, TaskStatus } from "./types"

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)

  async function loadTasks() {
    try {
      const nextTasks = await fetchTasks()
      setTasks(nextTasks)
    } catch (error) {
      console.error("Failed to load tasks from Hasura", error)
    }
  }

  async function loadActivities() {
    try {
      const nextActivity = await fetchActivities()
      setActivity(nextActivity)
    } catch (error) {
      console.error("Failed to load activities from Hasura", error)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([loadTasks(), loadActivities()])
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const tasksSubscription = subscribeToTasks(setTasks)
    const activitiesSubscription = subscribeToActivities(setActivity)

    return () => {
      tasksSubscription.unsubscribe()
      activitiesSubscription.unsubscribe()
    }
  }, [])

  async function logActivity(message: string, taskId?: string) {
    try {
      await createActivity(message, taskId)
    } catch (error) {
      console.error("Failed to create activity", error)
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const statuses = await fetchWorkflowStatuses()
    const targetStatus = statuses.find((status) => status.id === newStatus)

    if (targetStatus?.dbId == null) return

    await moveTaskWithActivityLogAction(taskId, targetStatus.dbId)
  }

  const addTask = async (
    title: string,
    status: TaskStatus,
    priority: Priority,
    tags: string[],
    dueDate: string,
    description?: string
  ) => {
    const statuses = await fetchWorkflowStatuses()
    const targetStatus = statuses.find((workflowStatus) => workflowStatus.id === status)

    if (targetStatus?.dbId == null) return

    const nextPosition = tasks.filter((task) => task.status === status).length
    const taskId = await createTask({
      title,
      statusDbId: targetStatus.dbId,
      priority,
      tags,
      dueDate,
      description,
      position: nextPosition
    })

    await logActivity(`Task "${title}" created`, taskId)
  }

  const updateDescription = async (taskId: string, description: string) => {
    await updateTaskFields(taskId, { description })
  }

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((currentTask) => currentTask.id === taskId)

    await deleteTaskById(taskId)

    if (task) {
      await logActivity(`Task "${task.title}" deleted`)
    }
  }

  const reorderTask = async (dragId: string, hoverId: string) => {
    const dragTask = tasks.find((task) => task.id === dragId)
    const hoverTask = tasks.find((task) => task.id === hoverId)

    if (!dragTask || !hoverTask) return
    if (dragTask.status !== hoverTask.status) return

    const statusTasks = tasks.filter((task) => task.status === dragTask.status)
    const dragIndex = statusTasks.findIndex((task) => task.id === dragId)
    const hoverIndex = statusTasks.findIndex((task) => task.id === hoverId)

    if (dragIndex === -1 || hoverIndex === -1) return

    const reorderedTasks = [...statusTasks]
    const [movedTask] = reorderedTasks.splice(dragIndex, 1)
    reorderedTasks.splice(hoverIndex, 0, movedTask)

    await reorderTasksInHasura(reorderedTasks.map((task) => task.id))
    await logActivity("Tasks reordered")
  }

  const updateTask = async (taskId: string, newTitle: string) => {
    await updateTaskFields(taskId, { title: newTitle })
    await logActivity("Task title updated", taskId)
  }

  const updateDueDate = async (taskId: string, dueDate: string) => {
    await updateTaskFields(taskId, { dueDate })
    await logActivity("Due date updated", taskId)
  }

  const updatePriority = async (taskId: string, priority: Priority) => {
    await updateTaskFields(taskId, { priority })
    await logActivity(`Priority changed to ${priority}`, taskId)
  }

  const updateTags = async (taskId: string, tags: string[]) => {
    await replaceTaskTags(taskId, tags)
    await logActivity("Tags updated", taskId)
  }

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
