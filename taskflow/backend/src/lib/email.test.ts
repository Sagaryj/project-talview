describe("email helpers", () => {
  const originalEnv = { ...process.env }
  let sendMock: jest.Mock
  let commandInputs: unknown[]

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    sendMock = jest.fn().mockResolvedValue({})
    commandInputs = []

    jest.doMock("@aws-sdk/client-ses", () => ({
      SESClient: jest.fn().mockImplementation(() => ({ send: sendMock })),
      SendEmailCommand: jest.fn().mockImplementation((input) => {
        commandInputs.push(input)
        return { input }
      })
    }))
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.dontMock("@aws-sdk/client-ses")
  })

  it("throws when SES_FROM_EMAIL is missing", async () => {
    delete process.env.SES_FROM_EMAIL
    const { sendVerificationCodeEmail } = await import("./email")

    await expect(sendVerificationCodeEmail({ email: "a@example.com", name: "A", otp: "123456" })).rejects.toThrow(
      "SES_FROM_EMAIL is not configured"
    )
  })

  it("sends a welcome email through SES", async () => {
    process.env.SES_FROM_EMAIL = "sender@example.com"
    const { sendWelcomeEmail } = await import("./email")

    await sendWelcomeEmail({ email: "person@example.com", name: "Person" })

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(commandInputs[0]).toMatchObject({
      Source: "sender@example.com",
      Destination: { ToAddresses: ["person@example.com"] }
    })
  })
})
