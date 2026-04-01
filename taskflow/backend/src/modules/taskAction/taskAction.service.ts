import { pool } from '../../config/db'
import { verifyAuthToken } from '../../lib/auth'
import { HttpError } from '../../lib/httpError'
import type { MoveTaskWithActivityLogInput, MoveTaskWithActivityLogPayload } from './taskAction.types'

function getUserIdFromAuthorization(authorizationHeader?: string): number {
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : null

  if (!token) {
    throw new HttpError(401, 'Missing auth token')
  }

  const payload = verifyAuthToken(token)
  if (!payload) {
    throw new HttpError(401, 'Invalid or expired auth token')
  }

  return Number(payload.userId)
}

export async function moveTaskWithActivityLog(
  input: MoveTaskWithActivityLogInput,
  authorizationHeader?: string
): Promise<MoveTaskWithActivityLogPayload> {
  const taskId = typeof input.taskId === 'number' ? input.taskId : Number(input.taskId)
  const targetStatusId = typeof input.targetStatusId === 'number' ? input.targetStatusId : Number(input.targetStatusId)
  const userId = getUserIdFromAuthorization(authorizationHeader)

  if (!Number.isFinite(taskId) || !Number.isFinite(targetStatusId)) {
    throw new HttpError(400, 'Task ID and target status ID are required')
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const taskResult = await client.query<{
      id: number
      title: string
      workflow_status_id: number | null
      position: number
    }>(
      `
        SELECT id, title, workflow_status_id, position
        FROM tasks
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
      `,
      [taskId, userId]
    )

    const task = taskResult.rows[0]
    if (!task) {
      throw new HttpError(404, 'Task not found')
    }

    const statusResult = await client.query<{ id: number; label: string }>(
      `
        SELECT id, label
        FROM workflow_statuses
        WHERE id = $1 AND user_id = $2
      `,
      [targetStatusId, userId]
    )

    const targetStatus = statusResult.rows[0]
    if (!targetStatus) {
      throw new HttpError(404, 'Target workflow status not found')
    }

    const positionResult = await client.query<{ max_position: number | null }>(
      `
        SELECT MAX(position) AS max_position
        FROM tasks
        WHERE user_id = $1 AND workflow_status_id = $2
      `,
      [userId, targetStatusId]
    )

    const nextPosition = (positionResult.rows[0]?.max_position ?? -1) + 1

    await client.query(
      `
        UPDATE tasks
        SET workflow_status_id = $1, position = $2, updated_at = NOW()
        WHERE id = $3
      `,
      [targetStatusId, nextPosition, taskId]
    )

    const activityMessage = `Task "${task.title}" moved to ${targetStatus.label}`

    const activityResult = await client.query<{ id: number }>(
      `
        INSERT INTO activities (user_id, task_id, message)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [userId, taskId, activityMessage]
    )

    await client.query('COMMIT')

    return {
      taskId,
      activityId: Number(activityResult.rows[0].id),
      activityMessage
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
