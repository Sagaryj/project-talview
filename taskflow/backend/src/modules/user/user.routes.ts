import { Router } from 'express'
import { addUser, listUsers } from './user.controller'

const userRouter = Router()

userRouter.get('/', listUsers)
userRouter.post('/', addUser)

export { userRouter }
