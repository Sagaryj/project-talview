import path from 'node:path'
import { NativeConnection, Worker } from '@temporalio/worker'
import * as activities from './activities/notification.activities'
import { TASK_QUEUE, TEMPORAL_ADDRESS } from './client'

async function runWorker() {
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS })

  const worker = await Worker.create({
    connection,
    workflowsPath: path.join(__dirname, 'workflows/taskReminder.workflow.js'),
    activities,
    taskQueue: TASK_QUEUE
  })

  console.log(`Temporal worker listening on ${TEMPORAL_ADDRESS} for ${TASK_QUEUE}`)
  await worker.run()
}

runWorker().catch((error) => {
  console.error('Temporal worker failed to start', error)
  process.exit(1)
})
