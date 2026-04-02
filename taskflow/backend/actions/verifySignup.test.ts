const poolConnect = jest.fn()
const createAuthToken = jest.fn()
const sendWelcomeEmail = jest.fn()
const seedDefaultWorkflowStatuses = jest.fn()

jest.mock("../src/config/db", () => ({
  pool: { connect: (...args: unknown[]) => poolConnect(...args) }
}))

jest.mock("../src/lib/auth", () => ({
  createAuthToken: (...args: unknown[]) => createAuthToken(...args)
}))

jest.mock("../src/lib/email", () => ({
  sendWelcomeEmail: (...args: unknown[]) => sendWelcomeEmail(...args)
}))

jest.mock("../src/lib/workflow", () => ({
  seedDefaultWorkflowStatuses: (...args: unknown[]) => seedDefaultWorkflowStatuses(...args)
}))

import { handler, verifySignupAction } from "./verifySignup"

describe("verifySignup action", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects missing fields", async () => {
    await expect(verifySignupAction({ email: "x@example.com" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Email and OTP are required"
    })
  })

  it("creates the user from a valid verification", async () => {
    const query = jest.fn()
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 11, name: "Test", email: "test@example.com", password_hash: "hash", otp_code: "123456", expires_at: new Date(Date.now() + 60000).toISOString(), verified: false }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 8, name: "Test", email: "test@example.com" }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    const release = jest.fn()
    poolConnect.mockResolvedValue({ query, release })
    createAuthToken.mockReturnValue("token")
    sendWelcomeEmail.mockResolvedValue(undefined)
    seedDefaultWorkflowStatuses.mockResolvedValue(undefined)

    const result = await verifySignupAction({ email: "test@example.com", otp: "123456" })

    expect(result).toEqual({
      token: "token",
      user: { id: 8, name: "Test", email: "test@example.com" }
    })
    expect(seedDefaultWorkflowStatuses).toHaveBeenCalledWith(8)
    expect(sendWelcomeEmail).toHaveBeenCalledWith({ email: "test@example.com", name: "Test" })
    expect(release).toHaveBeenCalled()
  })

  it("supports the Hasura handler wrapper", async () => {
    const query = jest.fn()
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 11, name: "User", email: "user@example.com", password_hash: "hash", otp_code: "123456", expires_at: new Date(Date.now() + 60000).toISOString(), verified: false }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "User", email: "user@example.com" }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    const release = jest.fn()
    poolConnect.mockResolvedValue({ query, release })
    createAuthToken.mockReturnValue("token")
    sendWelcomeEmail.mockResolvedValue(undefined)
    seedDefaultWorkflowStatuses.mockResolvedValue(undefined)

    await expect(handler({ input: { email: "user@example.com", otp: "123456" } })).resolves.toEqual({
      token: "token",
      user: { id: 1, name: "User", email: "user@example.com" }
    })
  })
})
