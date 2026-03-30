import { gql } from "@apollo/client"

export const FETCH_ACTIVITIES = gql`
  query FetchActivities($userId: bigint!) {
    activities(
      where: { user_id: { _eq: $userId } }
      order_by: [{ id: desc }]
      limit: 50
    ) {
      id
      message
      created_at
    }
  }
`

export const ACTIVITIES_SUBSCRIPTION = gql`
  subscription ActivitiesSubscription($userId: bigint!) {
    activities(
      where: { user_id: { _eq: $userId } }
      order_by: [{ id: desc }]
      limit: 50
    ) {
      id
      message
      created_at
    }
  }
`

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity($message: String!, $taskId: bigint, $userId: bigint!) {
    insert_activities_one(
      object: {
        user_id: $userId
        task_id: $taskId
        message: $message
      }
    ) {
      id
    }
  }
`
