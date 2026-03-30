import { apolloClient } from "../../../lib/apollo"
import { requireAuthSession } from "../../../lib/auth"
import type { Priority } from "../types"
import { mapTask } from "./mappers"
import type { GraphqlTask } from "./types"
import {
  CREATE_TASK,
  DELETE_TASK,
  DELETE_TASK_TAGS,
  FETCH_TASKS,
  INSERT_TASK_TAGS,
  MOVE_TASK_WITH_ACTIVITY_LOG,
  TASKS_SUBSCRIPTION,
  UPDATE_TASK
} from "../graphql/tasks"

interface FetchTasksResponse {
  tasks: GraphqlTask[]
}

interface MoveTaskWithActivityLogResponse {
  moveTaskWithActivityLog?: {
    taskId: number
    activityId: number
    activityMessage: string
  }
}

export async function fetchTasks() {
  const session = requireAuthSession()
  const { data } = await apolloClient.query<FetchTasksResponse>({
    query: FETCH_TASKS,
    variables: { userId: session.user.id },
    fetchPolicy: "cache-first"
  })

  return (data?.tasks ?? []).map(mapTask)
}

export function subscribeToTasks(onNext: (tasks: ReturnType<typeof mapTask>[]) => void) {
  const session = requireAuthSession()

  return apolloClient
    .subscribe<FetchTasksResponse>({
      query: TASKS_SUBSCRIPTION,
      variables: { userId: session.user.id }
    })
    .subscribe({
      next: ({ data }) => {
        if (data?.tasks == null) return

        apolloClient.writeQuery<FetchTasksResponse>({
          query: FETCH_TASKS,
          variables: { userId: session.user.id },
          data: { tasks: data.tasks }
        })

        onNext(data.tasks.map(mapTask))
      },
      error: (error) => {
        console.error("Tasks subscription failed", error)
      }
    })
}

export async function createTask(input: {
  title: string
  statusDbId: string
  priority: Priority
  dueDate?: string
  description?: string
  tags: string[]
  position: number
}) {
  const session = requireAuthSession()
  const { data } = await apolloClient.mutate<{
    insert_tasks_one: { id: number }
  }>({
    mutation: CREATE_TASK,
    variables: {
      title: input.title,
      description: input.description ?? null,
      workflowStatusId: Number(input.statusDbId),
      priority: input.priority,
      dueDate: input.dueDate || null,
      position: input.position,
      userId: session.user.id,
      tags: input.tags.map((name) => ({ name }))
    }
  })

  return String(data?.insert_tasks_one.id)
}

export async function moveTaskWithActivityLog(taskId: string, targetStatusDbId: string) {
  const { data } = await apolloClient.mutate<MoveTaskWithActivityLogResponse>({
    mutation: MOVE_TASK_WITH_ACTIVITY_LOG,
    variables: {
      taskId: Number(taskId),
      targetStatusId: Number(targetStatusDbId)
    }
  })

  if (data?.moveTaskWithActivityLog == null) {
    throw new Error("Move task action failed")
  }

  return data.moveTaskWithActivityLog
}

export async function updateTaskFields(
  taskId: string,
  changes: {
    title?: string
    description?: string
    workflowStatusDbId?: string
    priority?: Priority
    dueDate?: string
    position?: number
  }
) {
  const set: Record<string, unknown> = {}

  if (changes.title !== undefined) set.title = changes.title
  if (changes.description !== undefined) set.description = changes.description
  if (changes.workflowStatusDbId !== undefined) {
    set.workflow_status_id = Number(changes.workflowStatusDbId)
  }
  if (changes.priority !== undefined) set.priority = changes.priority
  if (changes.dueDate !== undefined) set.due_date = changes.dueDate || null
  if (changes.position !== undefined) set.position = changes.position

  await apolloClient.mutate({
    mutation: UPDATE_TASK,
    variables: {
      id: Number(taskId),
      _set: set
    }
  })
}

export async function replaceTaskTags(taskId: string, tags: string[]) {
  await apolloClient.mutate({
    mutation: DELETE_TASK_TAGS,
    variables: { taskId: Number(taskId) }
  })

  if (tags.length === 0) return

  await apolloClient.mutate({
    mutation: INSERT_TASK_TAGS,
    variables: {
      tags: tags.map((name) => ({
        task_id: Number(taskId),
        name
      }))
    }
  })
}

export async function deleteTask(taskId: string) {
  await apolloClient.mutate({
    mutation: DELETE_TASK,
    variables: { id: Number(taskId) }
  })
}

export async function reorderTasks(taskIds: string[]) {
  if (taskIds.length === 0) return

  await Promise.all(
    taskIds.map((taskId, index) =>
      apolloClient.mutate({
        mutation: UPDATE_TASK,
        variables: {
          id: Number(taskId),
          _set: { position: index }
        }
      })
    )
  )
}
