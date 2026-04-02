import type { NextFunction, Request, Response } from 'express'
import { createUser, getUsers } from './user.service'
import { success } from '../../utils/response'

interface CreateUserBody {
  name: string
  email: string
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
    const user = await createUser(request.body)
    success(response, user, 201)
  } catch (error) {
    next(error)
  }
}
