import type { NextFunction, Request, Response } from 'express'
import { moveTaskWithActivityLog } from './taskAction.service'

function getActionInput(body: unknown): Record<string, unknown> {
  if (body && typeof body === 'object' && 'input' in body) {
    return (body as { input?: Record<string, unknown> }).input ?? {}
  }

  return (body as Record<string, unknown> | undefined) ?? {}
}

export async function moveTaskAction(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await moveTaskWithActivityLog(getActionInput(request.body), request.headers.authorization)
    response.json(payload)
  } catch (error) {
    next(error)
  }
}
