import cors from 'cors'
import express from 'express'
import { authActionRouter, authApiRouter } from './modules/auth/auth.routes'
import { taskActionRouter } from './modules/taskAction/taskAction.routes'
import { userRouter } from './modules/user/user.routes'
import { taskReminderRouter } from './modules/taskReminder/taskReminder.routes'
import { errorMiddleware } from './middlewares/error.middleware'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.use('/users', userRouter)
app.use('/api/auth', authApiRouter)
app.use('/actions', authActionRouter)
app.use('/actions', taskActionRouter)
app.use('/hasura/events', taskReminderRouter)

app.use(errorMiddleware)
