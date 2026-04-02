import { CREATE_TASK, DELETE_TASK, FETCH_TASKS, MOVE_TASK_WITH_ACTIVITY_LOG, TASKS_SUBSCRIPTION, UPDATE_TASK } from "./tasks"

describe("kanban tasks GraphQL documents", () => {
  it("exports the expected task operations", () => {
    expect(FETCH_TASKS.definitions[0]).toMatchObject({ operation: "query", name: { value: "FetchTasks" } })
    expect(TASKS_SUBSCRIPTION.definitions[0]).toMatchObject({ operation: "subscription", name: { value: "TasksSubscription" } })
    expect(CREATE_TASK.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "CreateTask" } })
    expect(UPDATE_TASK.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "UpdateTask" } })
    expect(MOVE_TASK_WITH_ACTIVITY_LOG.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "MoveTaskWithActivityLog" } })
    expect(DELETE_TASK.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "DeleteTask" } })
  })
})
