import { gql } from "@apollo/client"

export const FETCH_WORKFLOW_STATUSES = gql`
  query FetchWorkflowStatuses($userId: bigint!) {
    workflow_statuses(
      where: { user_id: { _eq: $userId } }
      order_by: [{ position: asc }, { id: asc }]
    ) {
      id
      slug
      label
      color
      category
      system
      position
    }
  }
`

export const WORKFLOW_STATUSES_SUBSCRIPTION = gql`
  subscription WorkflowStatusesSubscription($userId: bigint!) {
    workflow_statuses(
      where: { user_id: { _eq: $userId } }
      order_by: [{ position: asc }, { id: asc }]
    ) {
      id
      slug
      label
      color
      category
      system
      position
    }
  }
`

export const CREATE_WORKFLOW_STATUS = gql`
  mutation CreateWorkflowStatus(
    $userId: bigint!
    $slug: String!
    $label: String!
    $color: String!
    $category: String!
    $position: Int!
  ) {
    insert_workflow_statuses_one(
      object: {
        user_id: $userId
        slug: $slug
        label: $label
        color: $color
        category: $category
        system: false
        position: $position
      }
    ) {
      id
    }
  }
`

export const UPDATE_WORKFLOW_STATUS = gql`
  mutation UpdateWorkflowStatus($id: bigint!, $_set: workflow_statuses_set_input!) {
    update_workflow_statuses_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
    }
  }
`

export const DELETE_WORKFLOW_STATUS = gql`
  mutation DeleteWorkflowStatus($statusId: bigint!, $fallbackId: bigint!) {
    update_tasks(
      where: { workflow_status_id: { _eq: $statusId } }
      _set: { workflow_status_id: $fallbackId }
    ) {
      affected_rows
    }
    delete_workflow_statuses_by_pk(id: $statusId) {
      id
    }
  }
`
