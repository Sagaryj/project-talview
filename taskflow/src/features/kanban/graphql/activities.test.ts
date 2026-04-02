import { CREATE_ACTIVITY, ACTIVITIES_SUBSCRIPTION, FETCH_ACTIVITIES } from "./activities"

describe("kanban activities GraphQL documents", () => {
  it("exports the expected operation names", () => {
    expect(FETCH_ACTIVITIES.definitions[0]).toMatchObject({ kind: "OperationDefinition", operation: "query", name: { value: "FetchActivities" } })
    expect(ACTIVITIES_SUBSCRIPTION.definitions[0]).toMatchObject({ kind: "OperationDefinition", operation: "subscription", name: { value: "ActivitiesSubscription" } })
    expect(CREATE_ACTIVITY.definitions[0]).toMatchObject({ kind: "OperationDefinition", operation: "mutation", name: { value: "CreateActivity" } })
  })
})
