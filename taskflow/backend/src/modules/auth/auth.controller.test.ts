import type { NextFunction, Request, Response } from "express"

const signupUser = jest.fn()
const loginUser = jest.fn()
const getCurrentUser = jest.fn()
const startSignupAction = jest.fn()
const verifySignupAction = jest.fn()

jest.mock("./auth.service", () => ({
  signupUser: (...args: unknown[]) => signupUser(...args),
  loginUser: (...args: unknown[]) => loginUser(...args),
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args)
}))

jest.mock("../../../actions/startSignup", () => ({
  startSignupAction: (...args: unknown[]) => startSignupAction(...args)
}))

jest.mock("../../../actions/verifySignup", () => ({
  verifySignupAction: (...args: unknown[]) => verifySignupAction(...args)
}))

import { login, me, signup, startSignup, verifySignup } from "./auth.controller"

function createResponse() {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  return { json, status }
}

describe("auth controller", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("passes Hasura input through signup and returns 201", async () => {
    const response = createResponse()
    const next = jest.fn() as NextFunction
    signupUser.mockResolvedValue({ token: "token", user: { id: 1 } })

    await signup({ body: { input: { name: "N", email: "e@example.com", password: "pw" } } } as Request, response as unknown as Response, next)

    expect(signupUser).toHaveBeenCalledWith({ name: "N", email: "e@example.com", password: "pw" })
    expect(response.status).toHaveBeenCalledWith(201)
  })

  it("returns login payload", async () => {
    const response = createResponse()
    loginUser.mockResolvedValue({ token: "token" })

    await login({ body: { input: { email: "e@example.com", password: "pw" } } } as Request, response as unknown as Response, jest.fn())

    expect(loginUser).toHaveBeenCalledWith({ email: "e@example.com", password: "pw" })
    expect(response.json).toHaveBeenCalledWith({ token: "token" })
  })

  it("uses authorization header for me", async () => {
    const response = createResponse()
    getCurrentUser.mockResolvedValue({ user: { id: 1 } })

    await me({ headers: { authorization: "Bearer token" } } as Request, response as unknown as Response, jest.fn())

    expect(getCurrentUser).toHaveBeenCalledWith("Bearer token")
    expect(response.json).toHaveBeenCalledWith({ user: { id: 1 } })
  })

  it("forwards startSignup input and returns 201", async () => {
    const response = createResponse()
    startSignupAction.mockResolvedValue({ message: "sent" })

    await startSignup({ body: { input: { name: "N", email: "e@example.com", password: "pw" } } } as Request, response as unknown as Response, jest.fn())

    expect(startSignupAction).toHaveBeenCalledWith({ name: "N", email: "e@example.com", password: "pw" })
    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.status().json).toHaveBeenCalledWith({ message: "sent" })
  })

  it("forwards verifySignup input", async () => {
    const response = createResponse()
    verifySignupAction.mockResolvedValue({ token: "token" })

    await verifySignup({ body: { input: { email: "e@example.com", otp: "123456" } } } as Request, response as unknown as Response, jest.fn())

    expect(verifySignupAction).toHaveBeenCalledWith({ email: "e@example.com", otp: "123456" })
    expect(response.json).toHaveBeenCalledWith({ token: "token" })
  })
})
