const poolQuery = jest.fn()
const poolConnect = jest.fn()
const sendVerificationCodeEmail = jest.fn()
const bcryptHash = jest.fn()

jest.mock("../src/config/db", () => ({
  pool: {
    query: (...args: unknown[]) => poolQuery(...args),
    connect: (...args: unknown[]) => poolConnect(...args)
  }
}))

jest.mock("../src/lib/email", () => ({
  sendVerificationCodeEmail: (...args: unknown[]) => sendVerificationCodeEmail(...args)
}))

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { hash: (...args: unknown[]) => bcryptHash(...args) }
}))

import { handler, startSignupAction } from "./startSignup"

describe("startSignup action", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects missing fields", async () => {
    await expect(startSignupAction({ email: "x@example.com" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Name, email, and password are required"
    })
  })

  it("creates a verification request and sends email", async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] })
    bcryptHash.mockResolvedValue("hashed-password")
    const query = jest.fn()
    query.mockResolvedValue({})
    const release = jest.fn()
    poolConnect.mockResolvedValue({ query, release })
    sendVerificationCodeEmail.mockResolvedValue(undefined)

    const result = await startSignupAction({ name: "Test", email: "TEST@example.com", password: "secret123" })

    expect(result).toEqual({ message: "Verification code sent to email" })
    expect(query).toHaveBeenCalledWith("BEGIN")
    expect(query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO email_verifications"), [
      "Test",
      "test@example.com",
      "hashed-password",
      expect.any(String)
    ])
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith({ email: "test@example.com", name: "Test", otp: expect.any(String) })
    expect(release).toHaveBeenCalled()
  })

  it("supports the Hasura handler wrapper", async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] })
    bcryptHash.mockResolvedValue("hashed-password")
    const query = jest.fn()
    query.mockResolvedValue({})
    const release = jest.fn()
    poolConnect.mockResolvedValue({ query, release })
    sendVerificationCodeEmail.mockResolvedValue(undefined)

    await expect(handler({ input: { name: "T", email: "t@example.com", password: "pw" } })).resolves.toEqual({
      message: "Verification code sent to email"
    })
  })
})
