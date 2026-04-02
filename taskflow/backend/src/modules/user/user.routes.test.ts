import express from "express"
import request from "supertest"

const listUsers = jest.fn((_req, res) => res.json({ route: "list" }))
const addUser = jest.fn((_req, res) => res.json({ route: "add" }))

jest.mock("./user.controller", () => ({
  listUsers,
  addUser
}))

import { userRouter } from "./user.routes"

describe("user routes", () => {
  it("registers GET and POST routes", async () => {
    const app = express()
    app.use(express.json())
    app.use("/users", userRouter)

    await request(app).get("/users")
    await request(app).post("/users").send({})

    expect(listUsers).toHaveBeenCalled()
    expect(addUser).toHaveBeenCalled()
  })
})
