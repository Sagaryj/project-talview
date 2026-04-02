import express from "express"
import request from "supertest"

const moveTaskAction = jest.fn((_req, res) => res.json({ ok: true }))

jest.mock("./taskAction.controller", () => ({
  moveTaskAction
}))

import { taskActionRouter } from "./taskAction.routes"

describe("task action routes", () => {
  it("registers the move-task-with-activity-log route", async () => {
    const app = express()
    app.use(express.json())
    app.use("/actions", taskActionRouter)

    await request(app).post("/actions/move-task-with-activity-log").send({ input: { taskId: 1, targetStatusId: 2 } })

    expect(moveTaskAction).toHaveBeenCalled()
  })
})
