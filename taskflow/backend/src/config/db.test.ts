const mockPoolConstructor = jest.fn()

jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation((config) => {
    mockPoolConstructor(config)
    return { config }
  })
}))

describe("db config", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    mockPoolConstructor.mockClear()
  })

  it("creates the pool with env values", async () => {
    process.env.DB_USER = "demo-user"
    process.env.DB_PASSWORD = "demo-pass"
    process.env.DB_HOST = "db-host"
    process.env.DB_PORT = "6543"
    process.env.DB_NAME = "demo-db"

    const { pool } = await import("./db")

    expect(pool).toBeDefined()
    expect(mockPoolConstructor).toHaveBeenCalledWith({
      user: "demo-user",
      password: "demo-pass",
      host: "db-host",
      port: 6543,
      database: "demo-db"
    })
  })
})
