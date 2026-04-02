import { mapActivity, mapTask, mapWorkflowStatus } from "./mappers"

describe("kanban hasura mappers", () => {
  it("maps workflow statuses to frontend shape", () => {
    expect(
      mapWorkflowStatus({
        id: 7,
        slug: "in-progress",
        label: "In Progress",
        color: "#6366f1",
        category: "active",
        system: true,
        position: 2
      })
    ).toEqual({
      id: "in-progress",
      dbId: "7",
      label: "In Progress",
      color: "#6366f1",
      category: "active",
      system: true,
      position: 2
    })
  })

  it("maps tasks and falls back to the default status when workflow status is missing", () => {
    expect(
      mapTask({
        id: 11,
        title: "Write docs",
        description: null,
        priority: "high",
        due_date: null,
        position: 0,
        workflow_status: null,
        task_tags: [{ name: "docs" }, { name: "frontend" }]
      })
    ).toEqual({
      id: "11",
      title: "Write docs",
      description: undefined,
      status: "todo",
      priority: "high",
      dueDate: undefined,
      tags: ["docs", "frontend"]
    })
  })

  it("maps activities to timestamps", () => {
    expect(
      mapActivity({ id: 3, message: "Task moved", created_at: "2026-04-02T09:00:00.000Z" })
    ).toEqual({
      id: "3",
      message: "Task moved",
      timestamp: new Date("2026-04-02T09:00:00.000Z").getTime()
    })
  })
})
