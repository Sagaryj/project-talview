import { startTaskReminder } from './temporal/client'

async function main() {
  const dueAtIso = new Date(Date.now() + 2 * 60 * 1000).toISOString()
  const result = await startTaskReminder('sample-task-1', dueAtIso, 'demo@example.com', 'Asia/Kolkata')
  console.log('Temporal workflow started', result)
  console.log('Reminder will fire about 1 minute before the due time in this sample run')
}

main().catch((error) => {
  console.error('Temporal test failed', error)
  process.exit(1)
})
