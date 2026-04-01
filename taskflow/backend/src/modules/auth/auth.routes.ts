import { Router } from 'express'
import { login, me, signup, startSignup, verifySignup } from './auth.controller'

const authApiRouter = Router()
authApiRouter.post('/signup', signup)
authApiRouter.post('/login', login)
authApiRouter.get('/me', me)

const authActionRouter = Router()
authActionRouter.post('/signup', signup)
authActionRouter.post('/login', login)
authActionRouter.post('/me', me)
authActionRouter.post('/start-signup', startSignup)
authActionRouter.post('/verify-signup', verifySignup)

export { authApiRouter, authActionRouter }
