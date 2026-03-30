import { useEffect, useState } from "react"
import type { WorkflowCategory, WorkflowStatus } from "../../types/workflow"
import {
  createWorkflowStatus,
  deleteWorkflowStatus,
  fetchWorkflowStatuses,
  reorderWorkflowStatuses,
  resetWorkflowStatuses,
  subscribeToWorkflowStatuses
} from "./hasura"
import { defaultWorkflowStatuses, slugifyWorkflowLabel } from "./workflowConfig"

export function useWorkflow() {
  const [statuses, setStatuses] = useState<WorkflowStatus[]>(defaultWorkflowStatuses)

  async function loadWorkflowStatuses() {
    try {
      const nextStatuses = await fetchWorkflowStatuses()
      setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultWorkflowStatuses)
    } catch (error) {
      console.error("Failed to load workflow statuses from Hasura", error)
      setStatuses(defaultWorkflowStatuses)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkflowStatuses()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const subscription = subscribeToWorkflowStatuses((nextStatuses) => {
      setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultWorkflowStatuses)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addStatus = async (
    label: string,
    color: string,
    category: WorkflowCategory
  ) => {
    const baseId = slugifyWorkflowLabel(label)
    const fallbackId = baseId || `stage-${crypto.randomUUID().slice(0, 8)}`
    const id = statuses.some((status) => status.id === fallbackId)
      ? `${fallbackId}-${crypto.randomUUID().slice(0, 4)}`
      : fallbackId

    await createWorkflowStatus({
      slug: id,
      label: label.trim(),
      color,
      category,
      position: statuses.length
    })
  }

  const removeStatus = async (id: string) => {
    const target = statuses.find((status) => status.id === id)
    if (!target || target.system || !target.dbId || statuses.length === 1) return

    const fallbackStatus =
      statuses.find((status) => status.id !== id && status.category !== "completed") ??
      statuses.find((status) => status.id !== id)

    if (!fallbackStatus?.dbId) return

    await deleteWorkflowStatus(target.dbId, fallbackStatus.dbId)
  }

  const moveStatus = async (id: string, direction: "left" | "right") => {
    const index = statuses.findIndex((status) => status.id === id)
    if (index === -1) return

    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= statuses.length) return

    const nextStatuses = [...statuses]
    const [moved] = nextStatuses.splice(index, 1)
    nextStatuses.splice(targetIndex, 0, moved)

    await reorderWorkflowStatuses(nextStatuses)
  }

  const resetStatuses = async () => {
    await resetWorkflowStatuses()
  }

  return {
    statuses,
    addStatus,
    removeStatus,
    moveStatus,
    resetStatuses
  }
}
