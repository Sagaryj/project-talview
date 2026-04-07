import { Client, Connection, WorkflowExecutionAlreadyStartedError } from '@temporalio/client'

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233'
const TASK_QUEUE = 'task-queue'

let connectionPromise: Promise<Connection> | null = null
let clientPromise: Promise<Client> | null = null

async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = Connection.connect({ address: TEMPORAL_ADDRESS })
  }

  return connectionPromise
}

export async function getTemporalClient() {
  if (!clientPromise) {
    clientPromise = getConnection().then((connection) => new Client({ connection }))
  }

  return clientPromise
}

export async function startTaskReminder(taskId: string, dueAtIso: string, userEmail: string, userTimezone?: string | null) {
  const client = await getTemporalClient()

  try {
    const handle = await client.workflow.start('taskReminderWorkflow', {
      args: [taskId, dueAtIso, userEmail, userTimezone ?? null],
      taskQueue: TASK_QUEUE,
      workflowId: `task-${taskId}`
    })

    return {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      alreadyRunning: false
    }
  } catch (error) {
    if (error instanceof WorkflowExecutionAlreadyStartedError) {
      return {
        workflowId: `task-${taskId}`,
        runId: null,
        alreadyRunning: true
      }
    }

    throw error
  }
}

export { TASK_QUEUE, TEMPORAL_ADDRESS }
