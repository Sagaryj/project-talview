import { gql } from "@apollo/client"

export const FETCH_TASKS = gql`
  query FetchTasks($userId: bigint!) {
    tasks(
      where: { user_id: { _eq: $userId } }
      order_by: [{ position: asc }, { id: asc }]
    ) {
      id
      title
      description
      priority
      due_date
      position
      workflow_status {
        id
        slug
        label
        color
        category
        system
        position
      }
      task_tags(order_by: { name: asc }) {
        id
        name
      }
    }
  }
`

export const TASKS_SUBSCRIPTION = gql`
  subscription TasksSubscription($userId: bigint!) {
    tasks(
      where: { user_id: { _eq: $userId } }
      order_by: [{ position: asc }, { id: asc }]
    ) {
      id
      title
      description
      priority
      due_date
      position
      workflow_status {
        id
        slug
        label
        color
        category
        system
        position
      }
      task_tags(order_by: { name: asc }) {
        id
        name
      }
    }
  }
`

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $description: String
    $workflowStatusId: bigint!
    $priority: String!
    $dueDate: date
    $position: Int!
    $userId: bigint!
    $tags: [task_tags_insert_input!]!
  ) {
    insert_tasks_one(
      object: {
        user_id: $userId
        title: $title
        description: $description
        workflow_status_id: $workflowStatusId
        priority: $priority
        due_date: $dueDate
        position: $position
        task_tags: { data: $tags }
      }
    ) {
      id
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: bigint!, $_set: tasks_set_input!) {
    update_tasks_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
    }
  }
`

export const MOVE_TASK_WITH_ACTIVITY_LOG = gql`
  mutation MoveTaskWithActivityLog($taskId: Int!, $targetStatusId: Int!) {
    moveTaskWithActivityLog(taskId: $taskId, targetStatusId: $targetStatusId) {
      taskId
      activityId
      activityMessage
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: bigint!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`

export const DELETE_TASK_TAGS = gql`
  mutation DeleteTaskTags($taskId: bigint!) {
    delete_task_tags(where: { task_id: { _eq: $taskId } }) {
      affected_rows
    }
  }
`

export const INSERT_TASK_TAGS = gql`
  mutation InsertTaskTags($tags: [task_tags_insert_input!]!) {
    insert_task_tags(objects: $tags) {
      affected_rows
    }
  }
`
