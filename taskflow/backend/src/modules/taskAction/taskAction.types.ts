export interface MoveTaskWithActivityLogInput {
  taskId?: unknown
  targetStatusId?: unknown
}

export interface MoveTaskWithActivityLogPayload {
  taskId: number
  activityId: number
  activityMessage: string
}
