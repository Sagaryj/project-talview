import type { Response } from 'express'

export function success<T>(response: Response, data: T, statusCode = 200): Response {
  return response.status(statusCode).json({ data })
}
