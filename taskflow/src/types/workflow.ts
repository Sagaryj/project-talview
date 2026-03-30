export type WorkflowCategory = "pending" | "active" | "completed"

export interface WorkflowStatus {
  id: string
  dbId?: string
  label: string
  color: string
  category: WorkflowCategory
  system: boolean
  position?: number
}
