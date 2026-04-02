import type { NextFunction, Request, Response } from 'express'
import type { ObjectSchema } from 'joi'
import { HttpError } from '../lib/httpError'

function formatValidationError(error: { details: Array<{ message: string }> }) {
  return error.details.map((detail) => detail.message).join(', ')
}

export function validateBody(schema: ObjectSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(request.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      next(new HttpError(400, formatValidationError(error)))
      return
    }

    request.body = value
    next()
  }
}

export function validateActionInput(schema: ObjectSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const rawBody = request.body && typeof request.body === 'object'
      ? (request.body as Record<string, unknown>)
      : {}

    const hasActionInput = rawBody.input && typeof rawBody.input === 'object'
    const input = hasActionInput ? (rawBody.input as Record<string, unknown>) : rawBody

    const { error, value } = schema.validate(input, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      next(new HttpError(400, formatValidationError(error)))
      return
    }

    request.body = hasActionInput ? { ...rawBody, input: value } : value
    next()
  }
}
