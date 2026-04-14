import request from "supertest"

jest.mock("./modules/auth/auth.routes", () => {
  const express = jest.requireActual("express") as typeof import("express")
  return {
    authApiRouter: express.Router(),
    authActionRouter: express.Router()
  }
})

jest.mock("./modules/taskAction/taskAction.routes", () => {
  const express = jest.requireActual("express") as typeof import("express")
  return {
    taskActionRouter: express.Router()
  }
})

jest.mock("./modules/user/user.routes", () => {
  const express = jest.requireActual("express") as typeof import("express")
  return {
    userRouter: express.Router()
  }
})

jest.mock("./middlewares/error.middleware", () => ({
  errorMiddleware: (_error: unknown, _request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
    response.status(500).json({ message: "mocked" })
  }
}))

import { app } from "./app"

describe("app", () => {
  it("returns a healthy status from /api/health", async () => {
    const response = await request(app).get("/api/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })
})
