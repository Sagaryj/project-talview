describe("config", () => {
  const originalPort = process.env.API_PORT

  afterEach(() => {
    jest.resetModules()
    if (originalPort === undefined) {
      delete process.env.API_PORT
    } else {
      process.env.API_PORT = originalPort
    }
  })

  it("uses API_PORT when provided", () => {
    process.env.API_PORT = "5050"

    const { config } = require("./index") as typeof import("./index")

    expect(config.port).toBe(5050)
  })

  it("falls back to 4000", () => {
    delete process.env.API_PORT

    const { config } = require("./index") as typeof import("./index")

    expect(config.port).toBe(4000)
  })
})
