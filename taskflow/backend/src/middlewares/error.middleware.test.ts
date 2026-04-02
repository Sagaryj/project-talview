import type { NextFunction, Request, Response } from 'express'
import { errorMiddleware } from './error.middleware'

describe('error middleware', () => {
  it('uses the provided statusCode and message', () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response
    const error = Object.assign(new Error('Bad request'), { statusCode: 400 })

    errorMiddleware(error, {} as Request, response, jest.fn() as NextFunction)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ message: 'Bad request' })
  })

  it('falls back to 500 and a safe message', () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response
    const error = new Error('')

    errorMiddleware(error, {} as Request, response, jest.fn() as NextFunction)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ message: 'Unknown error' })
  })
})
