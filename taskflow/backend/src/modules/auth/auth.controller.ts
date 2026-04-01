import type { NextFunction, Request, Response } from 'express'
import { startSignupAction } from '../../../actions/startSignup'
import { verifySignupAction } from '../../../actions/verifySignup'
import { getCurrentUser, loginUser, signupUser } from './auth.service'

function getActionInput(body: unknown): Record<string, unknown> {
  if (body && typeof body === 'object' && 'input' in body) {
    return (body as { input?: Record<string, unknown> }).input ?? {}
  }

  return (body as Record<string, unknown> | undefined) ?? {}
}

export async function signup(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await signupUser(getActionInput(request.body))
    response.status(201).json(payload)
  } catch (error) {
    next(error)
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await loginUser(getActionInput(request.body))
    response.json(payload)
  } catch (error) {
    next(error)
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await getCurrentUser(request.headers.authorization)
    response.json(payload)
  } catch (error) {
    next(error)
  }
}

export async function startSignup(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await startSignupAction(getActionInput(request.body))
    response.status(201).json(payload)
  } catch (error) {
    next(error)
  }
}

export async function verifySignup(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await verifySignupAction(getActionInput(request.body))
    response.json(payload)
  } catch (error) {
    next(error)
  }
}
