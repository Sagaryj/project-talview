import type { Activity } from "../../../types/activity"
import type { WorkflowStatus } from "../../../types/workflow"
import { defaultWorkflowStatuses } from "../workflowConfig"
import type { Task } from "../types"
import type {
  GraphqlActivity,
  GraphqlTask,
  GraphqlWorkflowStatus
} from "./types"

export function mapWorkflowStatus(status: GraphqlWorkflowStatus): WorkflowStatus {
  return {
    id: status.slug,
    dbId: String(status.id),
    label: status.label,
    color: status.color,
    category: status.category,
    system: status.system,
    position: status.position
  }
}

export function mapTask(task: GraphqlTask): Task {
  return {
    id: String(task.id),
    title: task.title,
    description: task.description ?? undefined,
    status: task.workflow_status?.slug ?? defaultWorkflowStatuses[0].id,
    priority: task.priority,
    dueDate: task.due_date ?? undefined,
    tags: task.task_tags.map((tag) => tag.name)
  }
}

export function mapActivity(activity: GraphqlActivity): Activity {
  return {
    id: String(activity.id),
    message: activity.message,
    timestamp: new Date(activity.created_at).getTime()
  }
}
