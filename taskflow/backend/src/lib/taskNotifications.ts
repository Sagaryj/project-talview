import nodemailer from 'nodemailer'

const DEFAULT_TIMEZONE = 'UTC'
const DEFAULT_LOCAL_DUE_HOUR = 9

function getTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured for notification emails')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })
}

function getSender() {
  const sender = process.env.EMAIL_USER

  if (!sender) {
    throw new Error('EMAIL_USER must be configured for notification emails')
  }

  return sender
}

export function normalizeUserTimezone(timezone?: string | null) {
  if (!timezone) {
    return DEFAULT_TIMEZONE
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return timezone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const parts = formatter.formatToParts(date)
  const partMap = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  ) as Record<string, string>

  const asUtc = Date.UTC(
    Number(partMap.year),
    Number(partMap.month) - 1,
    Number(partMap.day),
    Number(partMap.hour),
    Number(partMap.minute),
    Number(partMap.second)
  )

  return asUtc - date.getTime()
}

export function resolveTaskDueAtIso(dueDate: string, timezone?: string | null) {
  const normalizedTimezone = normalizeUserTimezone(timezone)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const parsed = new Date(dueDate)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid due date: ${dueDate}`)
    }

    return parsed.toISOString()
  }

  const [year, month, day] = dueDate.split('-').map(Number)
  const baseUtcMillis = Date.UTC(year, month - 1, day, DEFAULT_LOCAL_DUE_HOUR, 0, 0, 0)
  let candidate = new Date(baseUtcMillis)

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const offset = getTimeZoneOffsetMs(candidate, normalizedTimezone)
    candidate = new Date(baseUtcMillis - offset)
  }

  return candidate.toISOString()
}

function formatDueAt(dueAtIso: string, timezone?: string | null) {
  const normalizedTimezone = normalizeUserTimezone(timezone)

  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: normalizedTimezone,
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date(dueAtIso))} (${normalizedTimezone})`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendNotificationEmail({
  to,
  subject,
  heading,
  intro,
  lines
}: {
  to: string
  subject: string
  heading: string
  intro: string
  lines: string[]
}) {
  const transporter = getTransporter()
  const sender = getSender()
  const text = [intro, '', ...lines].join('\n')
  const htmlLines = lines.map((line) => `<p style="margin: 0 0 12px;">${escapeHtml(line)}</p>`).join('')

  await transporter.sendMail({
    from: sender,
    to,
    subject,
    text,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="font-size: 12px; letter-spacing: 4px; font-weight: 700; color: #14b8a6; text-transform: uppercase; margin-bottom: 16px;">TaskFlow</div>
        <h2 style="margin: 0 0 16px; font-size: 24px; color: #0f172a;">${escapeHtml(heading)}</h2>
        <p style="margin: 0 0 16px;">${escapeHtml(intro)}</p>
        ${htmlLines}
      </div>
    `
  })
}

export async function sendTaskCreatedEmail({
  email,
  taskId,
  taskTitle,
  statusLabel,
  dueAtIso,
  timezone
}: {
  email: string
  taskId: string
  taskTitle: string
  statusLabel?: string | null
  dueAtIso?: string | null
  timezone?: string | null
}) {
  const dueLine = dueAtIso ? `Due: ${formatDueAt(dueAtIso, timezone)}` : 'Due: not set'

  await sendNotificationEmail({
    to: email,
    subject: `Task created: ${taskTitle}`,
    heading: 'New task added',
    intro: `A new task was added to your TaskFlow workspace: ${taskTitle}`,
    lines: [
      `Task ID: ${taskId}`,
      `Stage: ${statusLabel ?? 'Unassigned'}`,
      dueLine
    ]
  })
}

export async function sendTaskMovedEmail({
  email,
  taskId,
  taskTitle,
  fromStatusLabel,
  toStatusLabel,
  dueAtIso,
  timezone
}: {
  email: string
  taskId: string
  taskTitle: string
  fromStatusLabel?: string | null
  toStatusLabel: string
  dueAtIso?: string | null
  timezone?: string | null
}) {
  const lines = [
    `Task ID: ${taskId}`,
    `From: ${fromStatusLabel ?? 'Unassigned'}`,
    `To: ${toStatusLabel}`
  ]

  if (dueAtIso) {
    lines.push(`Due: ${formatDueAt(dueAtIso, timezone)}`)
  }

  await sendNotificationEmail({
    to: email,
    subject: `Task moved: ${taskTitle}`,
    heading: 'Task moved to a new stage',
    intro: `Your task "${taskTitle}" was moved in TaskFlow.`,
    lines
  })
}

export async function sendWorkflowStageCreatedEmail({
  email,
  stageLabel,
  color,
  category
}: {
  email: string
  stageLabel: string
  color: string
  category: string
}) {
  await sendNotificationEmail({
    to: email,
    subject: `Custom stage created: ${stageLabel}`,
    heading: 'New workflow stage created',
    intro: `A custom workflow stage was created in your TaskFlow board: ${stageLabel}`,
    lines: [
      `Category: ${category}`,
      `Color: ${color}`
    ]
  })
}

export async function sendReminderEmail({
  taskId,
  email,
  dueAtIso,
  reminderLabel,
  timezone
}: {
  taskId: string
  email: string
  dueAtIso: string
  reminderLabel: string
  timezone?: string | null
}) {
  await sendNotificationEmail({
    to: email,
    subject: `Task reminder: ${taskId} is due ${reminderLabel}`,
    heading: 'Task reminder',
    intro: `Your TaskFlow task is due ${reminderLabel}.`,
    lines: [
      `Task ID: ${taskId}`,
      `Due: ${formatDueAt(dueAtIso, timezone)}`
    ]
  })
}

export async function sendDueNowEmail({
  taskId,
  email,
  dueAtIso,
  timezone
}: {
  taskId: string
  email: string
  dueAtIso: string
  timezone?: string | null
}) {
  await sendNotificationEmail({
    to: email,
    subject: `Task due now: ${taskId}`,
    heading: 'Task due now',
    intro: 'Your TaskFlow task has reached its due time.',
    lines: [
      `Task ID: ${taskId}`,
      `Due: ${formatDueAt(dueAtIso, timezone)}`
    ]
  })
}
