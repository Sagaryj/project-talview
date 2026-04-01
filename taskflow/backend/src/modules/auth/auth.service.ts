import { pool } from '../../config/db'
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from '../../lib/auth'
import { HttpError } from '../../lib/httpError'
import { seedDefaultWorkflowStatuses } from '../../lib/workflow'
import type { AuthInput, AuthPayload, AuthUser, MePayload } from './auth.types'

function normalizeAuthInput(input: AuthInput) {
  return {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    password: typeof input.password === 'string' ? input.password : ''
  }
}

function normalizeUser(user: { id: number; name: string; email: string }): AuthUser {
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email
  }
}

export async function signupUser(input: AuthInput): Promise<AuthPayload> {
  const { name, email, password } = normalizeAuthInput(input)

  if (!name || !email || !password) {
    throw new HttpError(400, 'Name, email, and password are required')
  }

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existingUser.rowCount) {
    throw new HttpError(409, 'Email already exists')
  }

  const passwordHash = hashPassword(password)
  const createdUser = await pool.query<{ id: number; name: string; email: string }>(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `,
    [name, email, passwordHash]
  )

  const user = normalizeUser(createdUser.rows[0])
  await seedDefaultWorkflowStatuses(user.id)

  return {
    token: createAuthToken(user.id, user.email),
    user
  }
}

export async function loginUser(input: AuthInput): Promise<AuthPayload> {
  const { email, password } = normalizeAuthInput(input)

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required')
  }

  const result = await pool.query<{
    id: number
    name: string
    email: string
    password_hash: string
  }>(
    `
      SELECT id, name, email, password_hash
      FROM users
      WHERE email = $1
    `,
    [email]
  )

  const user = result.rows[0]
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password')
  }

  const normalizedUser = normalizeUser(user)

  return {
    token: createAuthToken(normalizedUser.id, normalizedUser.email),
    user: normalizedUser
  }
}

export async function getCurrentUser(authorizationHeader?: string): Promise<MePayload> {
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

  const result = await pool.query<{ id: number; name: string; email: string }>(
    `
      SELECT id, name, email
      FROM users
      WHERE id = $1
    `,
    [payload.userId]
  )

  const user = result.rows[0]
  if (!user) {
    throw new HttpError(404, 'User not found')
  }

  return { user: normalizeUser(user) }
}
