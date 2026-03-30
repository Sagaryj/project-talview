export type TaskStatus = string
export type Priority = "low" | "medium" | "high"
export interface Task  {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority 
  dueDate?: string
  tags?: string[]
}
