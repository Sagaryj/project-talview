import { pool } from '../../src/config/db'
import { normalizeUserTimezone, sendDueNowEmail, sendReminderEmail } from '../../src/lib/taskNotifications'

async function fetchTaskRecipient(taskId: string) {
  const result = await pool.query<{
    email: string | null
    timezone: string | null
    email_notifications: boolean
  }>(
    `
      SELECT u.email, u.timezone, u.email_notifications
      FROM tasks t
      JOIN users u ON u.id = t.user_id
      WHERE t.id = $1
      LIMIT 1
    `,
    [Number(taskId)]
  )

  return result.rows[0] ?? null
}

export async function sendReminder(
  taskId: string,
  _email: string,
  dueAtIso: string,
  reminderLabel: string,
  timezone?: string | null
) {
  const recipient = await fetchTaskRecipient(taskId)

  if (!recipient?.email || !recipient.email_notifications) {
    return { skipped: true }
  }

  return sendReminderEmail({
    taskId,
    email: recipient.email,
    dueAtIso,
    reminderLabel,
    timezone: normalizeUserTimezone(recipient.timezone ?? timezone)
  })
}

export async function sendDueNow(taskId: string, _email: string, dueAtIso: string, timezone?: string | null) {
  const recipient = await fetchTaskRecipient(taskId)

  if (!recipient?.email || !recipient.email_notifications) {
    return { skipped: true }
  }

  return sendDueNowEmail({
    taskId,
    email: recipient.email,
    dueAtIso,
    timezone: normalizeUserTimezone(recipient.timezone ?? timezone)
  })
}
