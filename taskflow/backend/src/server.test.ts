const listen = jest.fn()

jest.mock("./app", () => ({
  app: { listen: (...args: unknown[]) => listen(...args) }
}))

jest.mock("./config", () => ({
  config: { port: 4321 }
}))

describe("server", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it("starts the app on the configured port", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined)

    await import("./server")

    expect(listen).toHaveBeenCalledWith(4321, expect.any(Function))
    const callback = listen.mock.calls[0][1] as () => void
    callback()
    expect(logSpy).toHaveBeenCalledWith("Taskflow auth backend listening on http://localhost:4321")

    logSpy.mockRestore()
  })
})
