export type TaskStatus = "todo" | "in-progress" | "done"
export type Priority = "low" | "medium" | "high"
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority 
  dueDate?: string
}
