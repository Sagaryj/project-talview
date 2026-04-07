import { pool } from '../../config/db'
import {
  normalizeUserTimezone,
  resolveTaskDueAtIso,
  sendTaskCreatedEmail,
  sendTaskMovedEmail,
  sendWorkflowStageCreatedEmail
} from '../../lib/taskNotifications'
import { startTaskReminder } from '../../../temporal/client'
import type {
  HasuraTaskInsertEvent,
  HasuraTaskUpdateEvent,
  HasuraWorkflowStatusInsertEvent,
  TaskReminderEventPayload
} from './taskReminder.types'

async function fetchTaskNotificationContext(taskId: number, userId: number) {
  const result = await pool.query<{
    title: string
    due_date: string | null
    status_label: string | null
    email: string | null
    timezone: string | null
    email_notifications: boolean
  }>(
    `
      SELECT
        t.title,
        t.due_date,
        ws.label AS status_label,
        u.email,
        u.timezone,
        u.email_notifications
      FROM tasks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN workflow_statuses ws ON ws.id = t.workflow_status_id
      WHERE t.id = $1 AND t.user_id = $2
      LIMIT 1
    `,
    [taskId, userId]
  )

  return result.rows[0] ?? null
}

async function fetchUserNotificationContext(userId: number) {
  const result = await pool.query<{ email: string | null; timezone: string | null; email_notifications: boolean }>(
    `
      SELECT email, timezone, email_notifications
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  )

  return result.rows[0] ?? null
}

async function fetchStatusLabels(statusIds: number[]) {
  if (statusIds.length === 0) {
    return new Map<number, string>()
  }

  const result = await pool.query<{ id: number; label: string }>(
    `
      SELECT id, label
      FROM workflow_statuses
      WHERE id = ANY($1::bigint[])
    `,
    [statusIds]
  )

  return new Map(result.rows.map((row) => [Number(row.id), row.label]))
}

export async function handleTaskCreatedEvent(payload: HasuraTaskInsertEvent): Promise<TaskReminderEventPayload> {
  const createdTask = payload.event.data.new
  const taskId = Number(createdTask.id)
  const userId = Number(createdTask.user_id)
  const context = await fetchTaskNotificationContext(taskId, userId)

  if (!context?.email) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'User email not found'
    }
  }

  const timezone = normalizeUserTimezone(context.timezone)
  const dueAtIso = context.due_date ? resolveTaskDueAtIso(context.due_date, timezone) : null

  if (context.email_notifications) {
    await sendTaskCreatedEmail({
      email: context.email,
      taskId: String(taskId),
      taskTitle: context.title,
      statusLabel: context.status_label,
      dueAtIso,
      timezone
    })
  }

  if (!dueAtIso) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: context.email_notifications,
      reminderScheduled: false,
      skipped: false,
      reason: 'Task has no due date'
    }
  }

  const result = await startTaskReminder(String(taskId), dueAtIso, context.email, timezone)

  return {
    workflowId: result.workflowId,
    runId: result.runId,
    alreadyRunning: result.alreadyRunning,
    emailSent: context.email_notifications,
    reminderScheduled: true,
    skipped: false
  }
}

export async function handleTaskUpdatedEvent(payload: HasuraTaskUpdateEvent): Promise<TaskReminderEventPayload> {
  const previousTask = payload.event.data.old
  const updatedTask = payload.event.data.new
  const previousStatusId = previousTask.workflow_status_id == null ? null : Number(previousTask.workflow_status_id)
  const updatedStatusId = updatedTask.workflow_status_id == null ? null : Number(updatedTask.workflow_status_id)

  if (previousStatusId === updatedStatusId) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'Workflow status did not change'
    }
  }

  const taskId = Number(updatedTask.id)
  const userId = Number(updatedTask.user_id)
  const context = await fetchTaskNotificationContext(taskId, userId)

  if (!context?.email || updatedStatusId == null) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'Notification context is incomplete'
    }
  }

  if (!context.email_notifications) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'Email notifications are disabled'
    }
  }

  const statusLabels = await fetchStatusLabels(
    [previousStatusId, updatedStatusId].filter((value): value is number => value != null)
  )
  const timezone = normalizeUserTimezone(context.timezone)
  const dueAtIso = context.due_date ? resolveTaskDueAtIso(context.due_date, timezone) : null

  await sendTaskMovedEmail({
    email: context.email,
    taskId: String(taskId),
    taskTitle: context.title,
    fromStatusLabel: previousStatusId == null ? null : statusLabels.get(previousStatusId) ?? null,
    toStatusLabel: statusLabels.get(updatedStatusId) ?? context.status_label ?? 'Updated',
    dueAtIso,
    timezone
  })

  return {
    workflowId: null,
    runId: null,
    alreadyRunning: false,
    emailSent: true,
    reminderScheduled: false,
    skipped: false
  }
}

export async function handleWorkflowStatusCreatedEvent(
  payload: HasuraWorkflowStatusInsertEvent
): Promise<TaskReminderEventPayload> {
  const createdStatus = payload.event.data.new

  if (createdStatus.system) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'System workflow stages do not trigger notifications'
    }
  }

  const userId = Number(createdStatus.user_id)
  const user = await fetchUserNotificationContext(userId)

  if (!user?.email) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'User email not found'
    }
  }

  if (!user.email_notifications) {
    return {
      workflowId: null,
      runId: null,
      alreadyRunning: false,
      emailSent: false,
      reminderScheduled: false,
      skipped: true,
      reason: 'Email notifications are disabled'
    }
  }

  await sendWorkflowStageCreatedEmail({
    email: user.email,
    stageLabel: createdStatus.label,
    color: createdStatus.color,
    category: createdStatus.category
  })

  return {
    workflowId: null,
    runId: null,
    alreadyRunning: false,
    emailSent: true,
    reminderScheduled: false,
    skipped: false
  }
}
