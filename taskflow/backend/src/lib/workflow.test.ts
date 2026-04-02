const query = jest.fn()

jest.mock("../config/db", () => ({
  pool: { query }
}))

import { seedDefaultWorkflowStatuses } from "./workflow"

describe("workflow helpers", () => {
  beforeEach(() => {
    query.mockReset()
    query.mockResolvedValue({})
  })

  it("inserts the default workflow statuses", async () => {
    await seedDefaultWorkflowStatuses(9)

    expect(query).toHaveBeenCalledTimes(3)
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT INTO workflow_statuses"),
      [9, "todo", "Todo", "#64748b", "pending", 0]
    )
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO workflow_statuses"),
      [9, "in-progress", "In Progress", "#6366f1", "active", 1]
    )
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO workflow_statuses"),
      [9, "done", "Done", "#22c55e", "completed", 2]
    )
  })
})
