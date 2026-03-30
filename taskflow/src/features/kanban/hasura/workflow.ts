import { apolloClient } from "../../../lib/apollo"
import { requireAuthSession } from "../../../lib/auth"
import type { WorkflowStatus } from "../../../types/workflow"
import { mapWorkflowStatus } from "./mappers"
import type { GraphqlWorkflowStatus } from "./types"
import {
  CREATE_WORKFLOW_STATUS,
  DELETE_WORKFLOW_STATUS,
  FETCH_WORKFLOW_STATUSES,
  UPDATE_WORKFLOW_STATUS,
  WORKFLOW_STATUSES_SUBSCRIPTION
} from "../graphql/workflow"

interface FetchWorkflowResponse {
  workflow_statuses: GraphqlWorkflowStatus[]
}

export async function fetchWorkflowStatuses() {
  const session = requireAuthSession()
  const { data } = await apolloClient.query<FetchWorkflowResponse>({
    query: FETCH_WORKFLOW_STATUSES,
    variables: { userId: session.user.id },
    fetchPolicy: "cache-first"
  })

  return (data?.workflow_statuses ?? []).map(mapWorkflowStatus)
}

export function subscribeToWorkflowStatuses(
  onNext: (statuses: ReturnType<typeof mapWorkflowStatus>[]) => void
) {
  const session = requireAuthSession()

  return apolloClient
    .subscribe<FetchWorkflowResponse>({
      query: WORKFLOW_STATUSES_SUBSCRIPTION,
      variables: { userId: session.user.id }
    })
    .subscribe({
      next: ({ data }) => {
        if (data?.workflow_statuses == null) return

        apolloClient.writeQuery<FetchWorkflowResponse>({
          query: FETCH_WORKFLOW_STATUSES,
          variables: { userId: session.user.id },
          data: { workflow_statuses: data.workflow_statuses }
        })

        onNext(data.workflow_statuses.map(mapWorkflowStatus))
      },
      error: (error) => {
        console.error("Workflow subscription failed", error)
      }
    })
}

export async function createWorkflowStatus(input: {
  label: string
  slug: string
  color: string
  category: WorkflowStatus["category"]
  position: number
}) {
  const session = requireAuthSession()
  await apolloClient.mutate({
    mutation: CREATE_WORKFLOW_STATUS,
    variables: {
      userId: session.user.id,
      slug: input.slug,
      label: input.label,
      color: input.color,
      category: input.category,
      position: input.position
    }
  })
}

export async function deleteWorkflowStatus(statusDbId: string, fallbackDbId: string) {
  await apolloClient.mutate({
    mutation: DELETE_WORKFLOW_STATUS,
    variables: {
      statusId: Number(statusDbId),
      fallbackId: Number(fallbackDbId)
    }
  })
}

export async function reorderWorkflowStatuses(statuses: WorkflowStatus[]) {
  if (statuses.length === 0) return

  await Promise.all(
    statuses
      .filter((status) => status.dbId)
      .map((status, index) =>
        apolloClient.mutate({
          mutation: UPDATE_WORKFLOW_STATUS,
          variables: {
            id: Number(status.dbId),
            _set: { position: index }
          }
        })
      )
  )
}

export async function resetWorkflowStatuses() {
  const currentStatuses = await fetchWorkflowStatuses()
  const customStatuses = currentStatuses.filter((status) => !status.system)
  const fallbackStatus = currentStatuses.find((status) => status.id === "todo")

  if (!fallbackStatus?.dbId) {
    throw new Error("Default todo status is missing in Hasura")
  }

  for (const status of customStatuses) {
    if (!status.dbId) continue
    await deleteWorkflowStatus(status.dbId, fallbackStatus.dbId)
  }

  const defaultWorkflowStatuses = [
    { id: "todo", label: "Todo", color: "#64748b", category: "pending" },
    { id: "in-progress", label: "In Progress", color: "#6366f1", category: "active" },
    { id: "done", label: "Done", color: "#22c55e", category: "completed" }
  ] as const

  for (const [index, defaultStatus] of defaultWorkflowStatuses.entries()) {
    const matchingStatus = currentStatuses.find((status) => status.id === defaultStatus.id)
    if (!matchingStatus?.dbId) continue

    await apolloClient.mutate({
      mutation: UPDATE_WORKFLOW_STATUS,
      variables: {
        id: Number(matchingStatus.dbId),
        _set: {
          label: defaultStatus.label,
          color: defaultStatus.color,
          category: defaultStatus.category,
          system: true,
          position: index
        }
      }
    })
  }
}
