const poolQuery = jest.fn()
const hashPassword = jest.fn()
const verifyPassword = jest.fn()
const createAuthToken = jest.fn()
const verifyAuthToken = jest.fn()
const seedDefaultWorkflowStatuses = jest.fn()

jest.mock("../../config/db", () => ({
  pool: { query: (...args: unknown[]) => poolQuery(...args) }
}))

jest.mock("../../lib/auth", () => ({
  hashPassword: (...args: unknown[]) => hashPassword(...args),
  verifyPassword: (...args: unknown[]) => verifyPassword(...args),
  createAuthToken: (...args: unknown[]) => createAuthToken(...args),
  verifyAuthToken: (...args: unknown[]) => verifyAuthToken(...args)
}))

jest.mock("../../lib/workflow", () => ({
  seedDefaultWorkflowStatuses: (...args: unknown[]) => seedDefaultWorkflowStatuses(...args)
}))

import { HttpError } from "../../lib/httpError"
import { getCurrentUser, loginUser, signupUser } from "./auth.service"

describe("auth service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("signs up a new user", async () => {
    poolQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 2, name: "Test", email: "test@example.com" }] })
    hashPassword.mockReturnValue("hashed")
    createAuthToken.mockReturnValue("token")

    const result = await signupUser({ name: " Test ", email: "TEST@example.com", password: "secret" })

    expect(hashPassword).toHaveBeenCalledWith("secret")
    expect(seedDefaultWorkflowStatuses).toHaveBeenCalledWith(2)
    expect(result).toEqual({
      token: "token",
      user: { id: 2, name: "Test", email: "test@example.com" }
    })
  })

  it("rejects duplicate signup email", async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] })

    await expect(signupUser({ name: "T", email: "t@example.com", password: "secret" })).rejects.toMatchObject({
      statusCode: 409,
      message: "Email already exists"
    } satisfies Partial<HttpError>)
  })

  it("rejects invalid login credentials", async () => {
    poolQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: "User", email: "user@example.com", password_hash: "hash" }] })
    verifyPassword.mockResolvedValue(false)

    await expect(loginUser({ email: "user@example.com", password: "bad" })).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password"
    } satisfies Partial<HttpError>)
  })

  it("returns the current user from a valid token", async () => {
    verifyAuthToken.mockReturnValue({ userId: 5 })
    poolQuery.mockResolvedValueOnce({ rows: [{ id: 5, name: "User", email: "user@example.com" }] })

    const result = await getCurrentUser("Bearer token")

    expect(verifyAuthToken).toHaveBeenCalledWith("token")
    expect(result).toEqual({ user: { id: 5, name: "User", email: "user@example.com" } })
  })

  it("rejects missing auth token", async () => {
    await expect(getCurrentUser(undefined)).rejects.toMatchObject({
      statusCode: 401,
      message: "Missing auth token"
    } satisfies Partial<HttpError>)
  })
})
