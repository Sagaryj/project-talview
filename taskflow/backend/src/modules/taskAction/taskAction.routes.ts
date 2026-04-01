import { Router } from 'express'
import { moveTaskAction } from './taskAction.controller'

const taskActionRouter = Router()

taskActionRouter.post('/move-task-with-activity-log', moveTaskAction)

export { taskActionRouter }