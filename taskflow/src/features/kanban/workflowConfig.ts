import type { Task } from "./types"
import type { WorkflowStatus } from "../../types/workflow"

export const WORKFLOW_STORAGE_KEY = "workflow-statuses"

export const defaultWorkflowStatuses: WorkflowStatus[] = [
  {
    id: "todo",
    label: "Todo",
    color: "#64748b",
    category: "pending",
    system: true
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "#6366f1",
    category: "active",
    system: true
  },
  {
    id: "done",
    label: "Done",
    color: "#22c55e",
    category: "completed",
    system: true
  }
]

function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<WorkflowStatus>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.color === "string" &&
    (candidate.category === "pending" ||
      candidate.category === "active" ||
      candidate.category === "completed") &&
    typeof candidate.system === "boolean"
  )
}

export function sanitizeWorkflowStatuses(value: unknown): WorkflowStatus[] {
  if (!Array.isArray(value)) return defaultWorkflowStatuses

  const validStatuses = value.filter(isWorkflowStatus)

  return validStatuses.length > 0 ? validStatuses : defaultWorkflowStatuses
}

export function getWorkflowStatuses(): WorkflowStatus[] {
  try {
    const saved = localStorage.getItem(WORKFLOW_STORAGE_KEY)

    return saved
      ? sanitizeWorkflowStatuses(JSON.parse(saved))
      : defaultWorkflowStatuses
  } catch {
    return defaultWorkflowStatuses
  }
}

export function slugifyWorkflowLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getCompletedStatusIds(statuses: WorkflowStatus[]) {
  return new Set(
    statuses
      .filter((status) => status.category === "completed")
      .map((status) => status.id)
  )
}

export function getDefaultStatusId(statuses: WorkflowStatus[]) {
  return (
    statuses.find((status) => status.category !== "completed")?.id ??
    statuses[0]?.id ??
    defaultWorkflowStatuses[0].id
  )
}

export function sanitizeTasksForWorkflow(tasks: Task[], statuses: WorkflowStatus[]) {
  const validIds = new Set(statuses.map((status) => status.id))
  const fallbackStatusId = getDefaultStatusId(statuses)

  return tasks.map((task) =>
    validIds.has(task.status)
      ? task
      : { ...task, status: fallbackStatusId }
  )
}
