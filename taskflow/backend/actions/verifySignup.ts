import { pool } from "../src/config/db"
import { createAuthToken } from "../src/lib/auth"
import { sendWelcomeEmail } from "../src/lib/email"
import { HttpError } from "../src/lib/httpError"
import { seedDefaultWorkflowStatuses } from "../src/lib/workflow"

interface VerifySignupInput {
  email?: unknown
  otp?: unknown
}

interface HasuraActionEvent<TInput> {
  input?: TInput
}

interface AuthPayload {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export async function verifySignupAction(input: VerifySignupInput): Promise<AuthPayload> {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : ""
  const otp = typeof input.otp === "string" ? input.otp.trim() : ""

  if (!email || !otp) {
    throw new HttpError(400, "Email and OTP are required")
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const verificationResult = await client.query<{
      id: number
      name: string
      email: string
      password_hash: string
      otp_code: string
      expires_at: string
      verified: boolean
    }>(
      `
        SELECT id, name, email, password_hash, otp_code, expires_at, verified
        FROM email_verifications
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [email]
    )

    const verification = verificationResult.rows[0]
    if (!verification) {
      throw new HttpError(404, "Verification request not found")
    }

    const now = Date.now()
    const expiresAt = new Date(verification.expires_at).getTime()

    if (verification.verified || verification.otp_code !== otp || Number.isNaN(expiresAt) || expiresAt < now) {
      throw new HttpError(400, "Invalid or expired verification code")
    }

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rowCount) {
      throw new HttpError(409, "Email already exists")
    }

    const createdUser = await client.query<{
      id: number
      name: string
      email: string
    }>(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email
      `,
      [verification.name, verification.email, verification.password_hash]
    )

    const user = createdUser.rows[0]

    await client.query("DELETE FROM email_verifications WHERE id = $1", [verification.id])
    await client.query("COMMIT")

    await seedDefaultWorkflowStatuses(Number(user.id))

    try {
      await sendWelcomeEmail({ email: user.email, name: user.name })
    } catch (error) {
      console.error("Welcome email failed", error)
    }

    return {
      token: createAuthToken(Number(user.id), user.email),
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email
      }
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function handler(event: HasuraActionEvent<VerifySignupInput>) {
  return verifySignupAction(event.input ?? {})
}
