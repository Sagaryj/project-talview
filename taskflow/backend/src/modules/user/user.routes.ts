import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.middleware'
import { addUser, listUsers } from './user.controller'
import { createUserSchema } from './user.schemas'

const userRouter = Router()

userRouter.get('/', listUsers)
userRouter.post('/', validateBody(createUserSchema), addUser)

export { userRouter }
