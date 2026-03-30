import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import { pool } from "./config/db"
import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from "./lib/auth"
import { HttpError } from "./lib/httpError"
import { seedDefaultWorkflowStatuses } from "./lib/workflow"
import { startSignupAction } from "../actions/startSignup"
import { verifySignupAction } from "../actions/verifySignup"

dotenv.config({ path: "../.env" })
dotenv.config()

const app = express()
const PORT = Number(process.env.API_PORT || 4000)

app.use(cors())
app.use(express.json())

app.get("/api/health", (_request, response) => {
  response.json({ ok: true })
})

app.post("/api/auth/signup", async (request, response) => {
  try {
    const payload = await signupUser(getAuthInput(request.body))
    response.status(201).json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/api/auth/login", async (request, response) => {
  try {
    const payload = await loginUser(getAuthInput(request.body))
    response.json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/signup", async (request, response) => {
  try {
    const payload = await signupUser(getAuthInput(request.body))
    response.status(201).json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/start-signup", async (request, response) => {
  try {
    const payload = await startSignupAction(getAuthInput(request.body))
    response.json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/verify-signup", async (request, response) => {
  try {
    const payload = await verifySignupAction(getAuthInput(request.body))
    response.json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/login", async (request, response) => {
  try {
    const payload = await loginUser(getAuthInput(request.body))
    response.json(payload)
  } catch (error) {
    handleError(response, error)
  }
})

app.get("/api/auth/me", async (request, response) => {
  try {
    const user = await getAuthenticatedUser(request)
    response.json({ user })
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/me", async (request, response) => {
  try {
    const user = await getAuthenticatedUser(request)
    response.json({ user })
  } catch (error) {
    handleError(response, error)
  }
})

app.post("/actions/move-task-with-activity-log", async (request, response) => {
  try {
    const result = await moveTaskWithActivityLog(request, getAuthInput(request.body))
    response.json(result)
  } catch (error) {
    handleError(response, error)
  }
})

app.listen(PORT, () => {
  console.log(`Taskflow auth backend listening on http://localhost:${PORT}`)
})

function getAuthInput(body: unknown) {
  if (body && typeof body === "object" && "input" in body) {
    return (body as { input?: Record<string, unknown> }).input ?? {}
  }

  return (body as Record<string, unknown> | undefined) ?? {}
}

async function signupUser(input: Record<string, unknown>) {
  const name = typeof input.name === "string" ? input.name : ""
  const email = typeof input.email === "string" ? input.email : ""
  const password = typeof input.password === "string" ? input.password : ""

  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new HttpError(400, "Name, email, and password are required")
  }

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email.trim().toLowerCase()]
  )

  if (existingUser.rowCount) {
    throw new HttpError(409, "Email already exists")
  }

  const passwordHash = hashPassword(password)

  const createdUser = await pool.query<{
    id: number
    name: string
    email: string
  }>(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `,
    [name.trim(), email.trim().toLowerCase(), passwordHash]
  )

  const user = createdUser.rows[0]

  const normalizedUser = {
    id: Number(user.id),
    name: user.name,
    email: user.email
  }

  await seedDefaultWorkflowStatuses(normalizedUser.id)

  return {
    token: createAuthToken(normalizedUser.id, normalizedUser.email),
    user: normalizedUser
  }
}

async function loginUser(input: Record<string, unknown>) {
  const email = typeof input.email === "string" ? input.email : ""
  const password = typeof input.password === "string" ? input.password : ""

  if (!email.trim() || !password.trim()) {
    throw new HttpError(400, "Email and password are required")
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
    [email.trim().toLowerCase()]
  )

  const user = result.rows[0]

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, "Invalid email or password")
  }

  const normalizedUser = {
    id: Number(user.id),
    name: user.name,
    email: user.email
  }

  return {
    token: createAuthToken(normalizedUser.id, normalizedUser.email),
    user: normalizedUser
  }
}

async function moveTaskWithActivityLog(
  request: express.Request,
  input: Record<string, unknown>
) {
  const user = await getAuthenticatedUser(request)
  const taskId = typeof input.taskId === "number" ? input.taskId : Number(input.taskId)
  const targetStatusId =
    typeof input.targetStatusId === "number"
      ? input.targetStatusId
      : Number(input.targetStatusId)

  if (!Number.isInteger(taskId) || !Number.isInteger(targetStatusId)) {
    throw new HttpError(400, "taskId and targetStatusId must be valid integers")
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const taskResult = await client.query<{
      id: number
      title: string
      workflow_status_id: number
    }>(
      `
        SELECT id, title, workflow_status_id
        FROM tasks
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
      `,
      [taskId, user.id]
    )

    const task = taskResult.rows[0]
    if (task == null) {
      throw new HttpError(404, "Task not found")
    }

    const statusResult = await client.query<{
      id: number
      label: string
      slug: string
    }>(
      `
        SELECT id, label, slug
        FROM workflow_statuses
        WHERE id = $1 AND user_id = $2
      `,
      [targetStatusId, user.id]
    )

    const targetStatus = statusResult.rows[0]
    if (targetStatus == null) {
      throw new HttpError(404, "Target workflow status not found")
    }

    await client.query(
      `
        UPDATE tasks
        SET workflow_status_id = $1
        WHERE id = $2 AND user_id = $3
      `,
      [targetStatus.id, task.id, user.id]
    )

    const activityMessage = `Task moved to ${targetStatus.label}`

    const activityResult = await client.query<{ id: number }>(
      `
        INSERT INTO activities (user_id, task_id, message)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [user.id, task.id, activityMessage]
    )

    await client.query("COMMIT")

    return {
      taskId: task.id,
      activityId: Number(activityResult.rows[0].id),
      activityMessage
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function getAuthenticatedUser(request: express.Request) {
  const authHeader = getAuthorizationHeader(request)
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null

  if (!token) {
    throw new HttpError(401, "Missing auth token")
  }

  const payload = verifyAuthToken(token)
  if (payload == null) {
    throw new HttpError(401, "Invalid or expired auth token")
  }

  const result = await pool.query<{
    id: number
    name: string
    email: string
  }>(
    `
      SELECT id, name, email
      FROM users
      WHERE id = $1
    `,
    [payload.userId]
  )

  const user = result.rows[0]
  if (user == null) {
    throw new HttpError(404, "User not found")
  }

  return {
    id: Number(user.id),
    name: user.name,
    email: user.email
  }
}

function getAuthorizationHeader(request: express.Request) {
  const header = request.headers.authorization
  if (typeof header === "string") return header

  const actionHeaders = request.body as
    | { session_variables?: Record<string, string | undefined> }
    | undefined

  const forwardedHeader = actionHeaders?.session_variables?.["x-hasura-authorization"]
  return typeof forwardedHeader === "string" ? forwardedHeader : null
}

function handleError(response: express.Response, error: unknown) {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  const message = error instanceof Error ? error.message : "Unknown error"
  response.status(500).json({ message })
}
