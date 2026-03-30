import { apolloClient } from "../../../lib/apollo"
import { requireAuthSession } from "../../../lib/auth"
import { mapActivity } from "./mappers"
import type { GraphqlActivity } from "./types"
import {
  ACTIVITIES_SUBSCRIPTION,
  CREATE_ACTIVITY,
  FETCH_ACTIVITIES
} from "../graphql/activities"

interface FetchActivitiesResponse {
  activities: GraphqlActivity[]
}

export async function fetchActivities() {
  const session = requireAuthSession()
  const { data } = await apolloClient.query<FetchActivitiesResponse>({
    query: FETCH_ACTIVITIES,
    variables: { userId: session.user.id },
    fetchPolicy: "cache-first"
  })

  return (data?.activities ?? []).map(mapActivity)
}

export function subscribeToActivities(
  onNext: (activities: ReturnType<typeof mapActivity>[]) => void
) {
  const session = requireAuthSession()

  return apolloClient
    .subscribe<FetchActivitiesResponse>({
      query: ACTIVITIES_SUBSCRIPTION,
      variables: { userId: session.user.id }
    })
    .subscribe({
      next: ({ data }) => {
        if (data?.activities == null) return

        apolloClient.writeQuery<FetchActivitiesResponse>({
          query: FETCH_ACTIVITIES,
          variables: { userId: session.user.id },
          data: { activities: data.activities }
        })

        onNext(data.activities.map(mapActivity))
      },
      error: (error) => {
        console.error("Activities subscription failed", error)
      }
    })
}

export async function createActivity(message: string, taskId?: string) {
  const session = requireAuthSession()
  await apolloClient.mutate({
    mutation: CREATE_ACTIVITY,
    variables: {
      message,
      taskId: taskId ? Number(taskId) : null,
      userId: session.user.id
    }
  })
}
