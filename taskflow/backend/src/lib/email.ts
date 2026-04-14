import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const region = process.env.AWS_REGION || process.env.SES_REGION || "ap-south-1"
const fromEmail = process.env.SES_FROM_EMAIL

const sesClient = new SESClient({ region })

function ensureSender() {
  if (!fromEmail) {
    throw new Error("SES_FROM_EMAIL is not configured")
  }

  return fromEmail
}

async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const sender = ensureSender()

  await sesClient.send(
    new SendEmailCommand({
      Source: sender,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: subject
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html
          },
          Text: {
            Charset: "UTF-8",
            Data: text
          }
        }
      }
    })
  )
}

export async function sendVerificationCodeEmail({
  email,
  name,
  otp
}: {
  email: string
  name: string
  otp: string
}) {
  const subject = "TaskFlow verification code"
  const text = [
    `Hello ${name}`,
    "",
    "Your TaskFlow verification code is:",
    "",
    otp,
    "",
    "This code expires in 10 minutes.",
    "",
    "If you did not request this email, ignore it."
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #0f172a;">TaskFlow verification code</h2>
      <p style="margin: 0 0 16px;">Hello ${escapeHtml(name)}</p>
      <p style="margin: 0 0 12px;">Your TaskFlow verification code is:</p>
      <div style="margin: 0 0 20px; padding: 16px; border-radius: 12px; background: #eef2ff; color: #312e81; font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center;">
        ${otp}
      </div>
      <p style="margin: 0 0 12px;">This code expires in 10 minutes.</p>
      <p style="margin: 0; color: #6b7280;">If you did not request this email, ignore it.</p>
    </div>
  `

  await sendEmail({ to: email, subject, html, text })
}

export async function sendWelcomeEmail({
  email,
  name
}: {
  email: string
  name: string
}) {
  const subject = "Welcome to TaskFlow"
  const text = [
    `Hello ${name}`,
    "",
    "Thank you for creating your TaskFlow account.",
    "We're excited to help you organize tasks, workflows, and deadlines in one place.",
    "",
    "You can now sign in and start planning your work.",
    "",
    "Team TaskFlow"
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; letter-spacing: 4px; font-weight: 700; color: #14b8a6; text-transform: uppercase;">TaskFlow</div>
      </div>
      <h2 style="margin: 0 0 16px; font-size: 28px; color: #0f172a;">Welcome aboard</h2>
      <p style="margin: 0 0 16px;">Hello ${escapeHtml(name)},</p>
      <p style="margin: 0 0 16px;">Thank you for creating your TaskFlow account. Your workspace is ready, and you can now start organizing tasks, workflows, and deadlines in one place.</p>
      <div style="margin: 24px 0; padding: 18px; border-radius: 16px; background: linear-gradient(135deg, #0f172a, #312e81); color: white;">
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">You're all set</div>
        <div style="font-size: 14px; opacity: 0.9;">Sign in to your TaskFlow account and start building your workflow.</div>
      </div>
      <p style="margin: 0; color: #6b7280;">Team TaskFlow</p>
    </div>
  `

  await sendEmail({ to: email, subject, html, text })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
