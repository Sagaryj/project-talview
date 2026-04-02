import { Router } from 'express'
import { validateActionInput } from '../../middlewares/validate.middleware'
import { moveTaskWithActivityLogSchema } from './taskAction.schemas'
import { moveTaskAction } from './taskAction.controller'

const taskActionRouter = Router()

taskActionRouter.post('/move-task-with-activity-log', validateActionInput(moveTaskWithActivityLogSchema), moveTaskAction)

export { taskActionRouter }
