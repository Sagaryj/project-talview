import { proxyActivities, sleep } from '@temporalio/workflow'
import type * as notificationActivities from '../activities/notification.activities'

const { sendReminder, sendDueNow } = proxyActivities<typeof notificationActivities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '10 seconds',
    maximumInterval: '1 minute',
    maximumAttempts: 3
  }
})

const REMINDER_SEQUENCE = [
  { offsetMs: 48 * 60 * 60 * 1000, label: 'in 2 days' },
  { offsetMs: 36 * 60 * 60 * 1000, label: 'in 1.5 days' },
  { offsetMs: 24 * 60 * 60 * 1000, label: 'in 1 day' },
  { offsetMs: 12 * 60 * 60 * 1000, label: 'in 12 hours' },
  { offsetMs: 6 * 60 * 60 * 1000, label: 'in 6 hours' },
  { offsetMs: 60 * 60 * 1000, label: 'in 1 hour' }
] as const

function resolveDueTimestamp(dueAtIso: string) {
  const timestamp = Date.parse(dueAtIso)

  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid due timestamp received by workflow: ${dueAtIso}`)
  }

  return timestamp
}

export async function taskReminderWorkflow(taskId: string, dueAtIso: string, userEmail: string, userTimezone?: string | null) {
  const dueTimestamp = resolveDueTimestamp(dueAtIso)

  for (const reminder of REMINDER_SEQUENCE) {
    const reminderTimestamp = dueTimestamp - reminder.offsetMs
    const now = Date.now()

    if (reminderTimestamp <= now) {
      continue
    }

    await sleep(reminderTimestamp - now)
    await sendReminder(taskId, userEmail, dueAtIso, reminder.label, userTimezone)
  }

  const postReminderNow = Date.now()
  if (dueTimestamp > postReminderNow) {
    await sleep(dueTimestamp - postReminderNow)
  }

  await sendDueNow(taskId, userEmail, dueAtIso, userTimezone)

  return {
    taskId,
    userEmail,
    dueAtIso,
    userTimezone,
    completed: true
  }
}
