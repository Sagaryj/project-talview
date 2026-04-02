import { HttpError } from "./httpError"

describe("HttpError", () => {
  it("stores the status code and message", () => {
    const error = new HttpError(418, "I am a teapot")

    expect(error).toBeInstanceOf(Error)
    expect(error.statusCode).toBe(418)
    expect(error.message).toBe("I am a teapot")
  })
})
