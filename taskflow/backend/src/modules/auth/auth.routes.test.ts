import express from "express"
import request from "supertest"

const login = jest.fn((_req, res) => res.json({ route: "login" }))
const me = jest.fn((_req, res) => res.json({ route: "me" }))
const signup = jest.fn((_req, res) => res.json({ route: "signup" }))
const startSignup = jest.fn((_req, res) => res.json({ route: "startSignup" }))
const verifySignup = jest.fn((_req, res) => res.json({ route: "verifySignup" }))

jest.mock("./auth.controller", () => ({
  login,
  me,
  signup,
  startSignup,
  verifySignup
}))

import { authActionRouter, authApiRouter } from "./auth.routes"

describe("auth routes", () => {
  beforeEach(() => jest.clearAllMocks())

  it("registers API auth routes", async () => {
    const app = express()
    app.use(express.json())
    app.use("/api/auth", authApiRouter)

    await request(app).post("/api/auth/signup").send({})
    await request(app).post("/api/auth/login").send({})
    await request(app).get("/api/auth/me")

    expect(signup).toHaveBeenCalled()
    expect(login).toHaveBeenCalled()
    expect(me).toHaveBeenCalled()
  })

  it("registers Hasura action routes", async () => {
    const app = express()
    app.use(express.json())
    app.use("/actions", authActionRouter)

    await request(app).post("/actions/start-signup").send({})
    await request(app).post("/actions/verify-signup").send({})

    expect(startSignup).toHaveBeenCalled()
    expect(verifySignup).toHaveBeenCalled()
  })
})
