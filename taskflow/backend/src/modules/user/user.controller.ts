import type { NextFunction, Request, Response } from 'express'
import { createUser, getUsers } from './user.service'
import { success } from '../../utils/response'

interface CreateUserBody {
  name?: unknown
  email?: unknown
}

export async function listUsers(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const users = await getUsers()
    success(response, users)
  } catch (error) {
    next(error)
  }
}

export async function addUser(
  request: Request<Record<string, never>, unknown, CreateUserBody>,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email } = request.body

    if (typeof name !== 'string' || typeof email !== 'string' || !name.trim() || !email.trim()) {
      const error = new Error('Name and email are required') as Error & { statusCode?: number }
      error.statusCode = 400
      throw error
    }

    const user = await createUser({ name, email })
    success(response, user, 201)
  } catch (error) {
    next(error)
  }
}
