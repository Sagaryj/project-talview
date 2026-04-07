import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.middleware'
import {
  taskCreatedEventSchema,
  taskUpdatedEventSchema,
  workflowStatusCreatedEventSchema
} from './taskReminder.schemas'
import {
  taskCreatedEvent,
  taskUpdatedEvent,
  workflowStatusCreatedEvent
} from './taskReminder.controller'

const taskReminderRouter = Router()

taskReminderRouter.post('/tasks-created', validateBody(taskCreatedEventSchema), taskCreatedEvent)
taskReminderRouter.post('/tasks-updated', validateBody(taskUpdatedEventSchema), taskUpdatedEvent)
taskReminderRouter.post(
  '/workflow-status-created',
  validateBody(workflowStatusCreatedEventSchema),
  workflowStatusCreatedEvent
)

export { taskReminderRouter }
