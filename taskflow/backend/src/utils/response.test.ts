import type { Response } from 'express'
import { success } from './response'

describe('success response helper', () => {
  it('returns the wrapped data with the provided status code', () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response
    const payload = { ok: true }

    success(response, payload, 201)

    expect(status).toHaveBeenCalledWith(201)
    expect(json).toHaveBeenCalledWith({ data: payload })
  })

  it('defaults to status code 200', () => {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response

    success(response, ['a', 'b'])

    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ data: ['a', 'b'] })
  })
})
