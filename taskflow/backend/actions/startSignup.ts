import { randomInt } from "crypto"
import bcrypt from "bcryptjs"
import { pool } from "../src/config/db"
import { sendVerificationCodeEmail } from "../src/lib/email"
import { HttpError } from "../src/lib/httpError"

interface StartSignupInput {
  name?: unknown
  email?: unknown
  password?: unknown
}

interface HasuraActionEvent<TInput> {
  input?: TInput
}

export interface StartSignupResponse {
  message: string
}

export async function startSignupAction(input: StartSignupInput): Promise<StartSignupResponse> {
  const name = typeof input.name === "string" ? input.name.trim() : ""
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : ""
  const password = typeof input.password === "string" ? input.password : ""

  if (!name || !email || !password) {
    throw new HttpError(400, "Name, email, and password are required")
  }

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])
  if (existingUser.rowCount) {
    throw new HttpError(409, "Email already exists")
  }

  const otp = String(randomInt(100000, 1000000))
  const passwordHash = await bcrypt.hash(password, 10)
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    await client.query(
      `
        DELETE FROM email_verifications
        WHERE email = $1
      `,
      [email]
    )

    await client.query(
      `
        INSERT INTO email_verifications (name, email, password_hash, otp_code, expires_at, verified)
        VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes', FALSE)
      `,
      [name, email, passwordHash, otp]
    )

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  try {
    await sendVerificationCodeEmail({ email, name, otp })
  } catch (error) {
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email])
    throw error
  }

  return {
    message: "Verification code sent to email"
  }
}

export async function handler(event: HasuraActionEvent<StartSignupInput>) {
  return startSignupAction(event.input ?? {})
}
