const poolConnect = jest.fn()
const verifyAuthToken = jest.fn()

jest.mock("../../config/db", () => ({
  pool: { connect: (...args: unknown[]) => poolConnect(...args) }
}))

jest.mock("../../lib/auth", () => ({
  verifyAuthToken: (...args: unknown[]) => verifyAuthToken(...args)
}))

import { moveTaskWithActivityLog } from "./taskAction.service"

describe("task action service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects when auth token is missing", async () => {
    await expect(moveTaskWithActivityLog({ taskId: 1, targetStatusId: 2 })).rejects.toMatchObject({
      statusCode: 401,
      message: "Missing auth token"
    })
  })

  it("rejects invalid ids", async () => {
    verifyAuthToken.mockReturnValue({ userId: 3 })

    await expect(moveTaskWithActivityLog({ taskId: "x", targetStatusId: 2 }, "Bearer token")).rejects.toMatchObject({
      statusCode: 400,
      message: "Task ID and target status ID are required"
    })
  })

  it("moves a task and writes an activity log", async () => {
    verifyAuthToken.mockReturnValue({ userId: 3 })
    const query = jest.fn()
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 5, title: "Task A", workflow_status_id: 1, position: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 9, label: "Done" }] })
      .mockResolvedValueOnce({ rows: [{ max_position: 2 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 77 }] })
      .mockResolvedValueOnce({})
    const release = jest.fn()
    poolConnect.mockResolvedValue({ query, release })

    const result = await moveTaskWithActivityLog({ taskId: 5, targetStatusId: 9 }, "Bearer token")

    expect(result).toEqual({
      taskId: 5,
      activityId: 77,
      activityMessage: 'Task "Task A" moved to Done'
    })
    expect(query).toHaveBeenCalledWith("BEGIN")
    expect(query).toHaveBeenLastCalledWith("COMMIT")
    expect(release).toHaveBeenCalled()
  })
})
