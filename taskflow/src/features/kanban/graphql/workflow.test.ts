import { CREATE_WORKFLOW_STATUS, DELETE_WORKFLOW_STATUS, FETCH_WORKFLOW_STATUSES, UPDATE_WORKFLOW_STATUS, WORKFLOW_STATUSES_SUBSCRIPTION } from "./workflow"

describe("kanban workflow GraphQL documents", () => {
  it("exports the expected workflow operations", () => {
    expect(FETCH_WORKFLOW_STATUSES.definitions[0]).toMatchObject({ operation: "query", name: { value: "FetchWorkflowStatuses" } })
    expect(WORKFLOW_STATUSES_SUBSCRIPTION.definitions[0]).toMatchObject({ operation: "subscription", name: { value: "WorkflowStatusesSubscription" } })
    expect(CREATE_WORKFLOW_STATUS.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "CreateWorkflowStatus" } })
    expect(UPDATE_WORKFLOW_STATUS.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "UpdateWorkflowStatus" } })
    expect(DELETE_WORKFLOW_STATUS.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "DeleteWorkflowStatus" } })
  })
})
