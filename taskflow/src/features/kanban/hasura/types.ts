import type { Priority } from "../types"
import type { WorkflowStatus } from "../../../types/workflow"

export type GraphqlWorkflowStatus = {
  id: number
  slug: string
  label: string
  color: string
  category: WorkflowStatus["category"]
  system: boolean
  position: number
}

export type GraphqlTask = {
  id: number
  title: string
  description: string | null
  priority: Priority
  due_date: string | null
  position: number
  workflow_status: GraphqlWorkflowStatus | null
  task_tags: Array<{ name: string }>
}

export type GraphqlActivity = {
  id: number
  message: string
  created_at: string
}
