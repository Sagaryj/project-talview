import type { NextFunction, Request, Response } from 'express'
import {
  handleTaskCreatedEvent,
  handleTaskUpdatedEvent,
  handleWorkflowStatusCreatedEvent
} from './taskReminder.service'
import type {
  HasuraTaskInsertEvent,
  HasuraTaskUpdateEvent,
  HasuraWorkflowStatusInsertEvent
} from './taskReminder.types'

export async function taskCreatedEvent(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await handleTaskCreatedEvent(request.body as HasuraTaskInsertEvent)
    response.json(payload)
  } catch (error) {
    next(error)
  }
}

export async function taskUpdatedEvent(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await handleTaskUpdatedEvent(request.body as HasuraTaskUpdateEvent)
    response.json(payload)
  } catch (error) {
    next(error)
  }
}

export async function workflowStatusCreatedEvent(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = await handleWorkflowStatusCreatedEvent(request.body as HasuraWorkflowStatusInsertEvent)
    response.json(payload)
  } catch (error) {
    next(error)
  }
}
