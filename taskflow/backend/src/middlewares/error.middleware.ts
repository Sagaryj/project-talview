import type { NextFunction, Request, Response } from 'express'

interface ErrorWithStatusCode extends Error {
  statusCode?: number
}

export function errorMiddleware(
  error: ErrorWithStatusCode,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  const statusCode = error.statusCode ?? 500
  const message = error.message || 'Unknown error'

  response.status(statusCode).json({ message })
}
