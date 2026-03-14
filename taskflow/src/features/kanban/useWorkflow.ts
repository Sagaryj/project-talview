import { useEffect, useRef, useState } from "react"
import type { WorkflowCategory, WorkflowStatus } from "../../types/workflow"
import {
  defaultWorkflowStatuses,
  getWorkflowStatuses,
  sanitizeTasksForWorkflow,
  slugifyWorkflowLabel,
  WORKFLOW_STORAGE_KEY
} from "./workflowConfig"

const WORKFLOW_EVENT = "taskflow:workflow-updated"

export function useWorkflow() {
  const instanceId = useRef(crypto.randomUUID())
  const [statuses, setStatuses] = useState<WorkflowStatus[]>(getWorkflowStatuses)
  const skipBroadcastRef = useRef(false)
  const lastSerializedRef = useRef<string | null>(null)

  useEffect(() => {
    const serialized = JSON.stringify(statuses)

    if (skipBroadcastRef.current) {
      skipBroadcastRef.current = false
      lastSerializedRef.current = serialized
      return
    }

    if (serialized === lastSerializedRef.current) {
      return
    }

    localStorage.setItem(WORKFLOW_STORAGE_KEY, serialized)
    lastSerializedRef.current = serialized
    window.dispatchEvent(
      new CustomEvent(WORKFLOW_EVENT, {
        detail: { sourceId: instanceId.current }
      })
    )
  }, [statuses])

  useEffect(() => {
    function syncWorkflow() {
      const nextStatuses = getWorkflowStatuses()
      const serialized = JSON.stringify(nextStatuses)

      if (serialized === lastSerializedRef.current) {
        return
      }

      skipBroadcastRef.current = true
      lastSerializedRef.current = serialized
      setStatuses(nextStatuses)
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === WORKFLOW_STORAGE_KEY) {
        syncWorkflow()
      }
    }

    function handleWorkflowEvent(event: Event) {
      const sourceId = (event as CustomEvent<{ sourceId?: string }>).detail?.sourceId
      if (sourceId === instanceId.current) return
      syncWorkflow()
    }

    window.addEventListener(WORKFLOW_EVENT, handleWorkflowEvent)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleWorkflowEvent)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  function persistTaskMigration(nextStatuses: WorkflowStatus[]) {
    try {
      const savedTasks = localStorage.getItem("kanban-tasks")
      if (!savedTasks) return

      const tasks = JSON.parse(savedTasks)
      const sanitizedTasks = sanitizeTasksForWorkflow(tasks, nextStatuses)

      localStorage.setItem("kanban-tasks", JSON.stringify(sanitizedTasks))
      window.dispatchEvent(
        new CustomEvent("taskflow:tasks-updated", {
          detail: { sourceId: `workflow:${instanceId.current}` }
        })
      )
    } catch {
      return
    }
  }

  const addStatus = (
    label: string,
    color: string,
    category: WorkflowCategory
  ) => {
    const baseId = slugifyWorkflowLabel(label)
    const fallbackId = baseId || `stage-${crypto.randomUUID().slice(0, 8)}`
    const id = statuses.some((status) => status.id === fallbackId)
      ? `${fallbackId}-${crypto.randomUUID().slice(0, 4)}`
      : fallbackId
    const newStatus = {
      id,
      label: label.trim(),
      color,
      category,
      system: false
    }

    setStatuses(prev => [...prev, newStatus])
  }

  const removeStatus = (id: string) => {
    setStatuses(prev => {
      const target = prev.find((status) => status.id === id)
      if (!target || target.system || prev.length === 1) return prev

      const nextStatuses = prev.filter((status) => status.id !== id)
      persistTaskMigration(nextStatuses)

      return nextStatuses
    })
  }

  const moveStatus = (id: string, direction: "left" | "right") => {
    setStatuses(prev => {
      const index = prev.findIndex((status) => status.id === id)
      if (index === -1) return prev

      const targetIndex = direction === "left" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev

      const nextStatuses = [...prev]
      const [moved] = nextStatuses.splice(index, 1)
      nextStatuses.splice(targetIndex, 0, moved)

      return nextStatuses
    })
  }

  const resetStatuses = () => {
    setStatuses(defaultWorkflowStatuses)
    persistTaskMigration(defaultWorkflowStatuses)
  }

  return {
    statuses,
    addStatus,
    removeStatus,
    moveStatus,
    resetStatuses
  }
}
