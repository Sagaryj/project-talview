export type WorkflowCategory = "pending" | "active" | "completed"

export interface WorkflowStatus {
  id: string
  label: string
  color: string
  category: WorkflowCategory
  system: boolean
}
