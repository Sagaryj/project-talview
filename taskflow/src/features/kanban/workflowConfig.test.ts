import {
  defaultWorkflowStatuses,
  getCompletedStatusIds,
  getDefaultStatusId,
  sanitizeTasksForWorkflow,
  sanitizeWorkflowStatuses,
  slugifyWorkflowLabel
} from "./workflowConfig"

describe("workflowConfig", () => {
  it("slugifies workflow labels consistently", () => {
    expect(slugifyWorkflowLabel("In Review / QA")).toBe("in-review-qa")
  })

  it("falls back to default statuses when the input is invalid", () => {
    expect(sanitizeWorkflowStatuses("bad input")).toEqual(defaultWorkflowStatuses)
  })

  it("returns completed ids and default status id from the status list", () => {
    const completedIds = getCompletedStatusIds(defaultWorkflowStatuses)

    expect(completedIds.has("done")).toBe(true)
    expect(getDefaultStatusId(defaultWorkflowStatuses)).toBe("todo")
  })

  it("reassigns tasks to the fallback status when their status no longer exists", () => {
    const tasks = [
      { id: "1", title: "Test", status: "missing", priority: "medium" as const }
    ]

    expect(sanitizeTasksForWorkflow(tasks, defaultWorkflowStatuses)).toEqual([
      { id: "1", title: "Test", status: "todo", priority: "medium" }
    ])
  })
})
