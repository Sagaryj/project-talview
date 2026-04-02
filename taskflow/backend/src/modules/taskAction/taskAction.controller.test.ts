import type { Request, Response } from "express"

const moveTaskWithActivityLog = jest.fn()

jest.mock("./taskAction.service", () => ({
  moveTaskWithActivityLog: (...args: unknown[]) => moveTaskWithActivityLog(...args)
}))

import { moveTaskAction } from "./taskAction.controller"

describe("task action controller", () => {
  beforeEach(() => jest.clearAllMocks())

  it("passes Hasura action input and authorization through to the service", async () => {
    const json = jest.fn()
    const response = { json } as unknown as Response
    moveTaskWithActivityLog.mockResolvedValue({ taskId: 1, activityId: 2, activityMessage: "done" })

    await moveTaskAction(
      {
        body: { input: { taskId: 1, targetStatusId: 2 } },
        headers: { authorization: "Bearer token" }
      } as Request,
      response,
      jest.fn()
    )

    expect(moveTaskWithActivityLog).toHaveBeenCalledWith({ taskId: 1, targetStatusId: 2 }, "Bearer token")
    expect(json).toHaveBeenCalledWith({ taskId: 1, activityId: 2, activityMessage: "done" })
  })
})
