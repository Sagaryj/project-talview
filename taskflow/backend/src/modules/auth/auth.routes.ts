import { Router } from 'express'
import { validateActionInput } from '../../middlewares/validate.middleware'
import { loginSchema, signupSchema, startSignupSchema, verifySignupSchema } from './auth.schemas'
import { login, me, signup, startSignup, verifySignup } from './auth.controller'

const authApiRouter = Router()
authApiRouter.post('/signup', validateActionInput(signupSchema), signup)
authApiRouter.post('/login', validateActionInput(loginSchema), login)
authApiRouter.get('/me', me)

const authActionRouter = Router()
authActionRouter.post('/signup', validateActionInput(signupSchema), signup)
authActionRouter.post('/login', validateActionInput(loginSchema), login)
authActionRouter.post('/me', me)
authActionRouter.post('/start-signup', validateActionInput(startSignupSchema), startSignup)
authActionRouter.post('/verify-signup', validateActionInput(verifySignupSchema), verifySignup)

export { authApiRouter, authActionRouter }
