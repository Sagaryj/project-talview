import type { Response } from "express"

const getUsers = jest.fn()
const createUser = jest.fn()
const success = jest.fn()

jest.mock("./user.service", () => ({
  getUsers: (...args: unknown[]) => getUsers(...args),
  createUser: (...args: unknown[]) => createUser(...args)
}))

jest.mock("../../utils/response", () => ({
  success: (...args: unknown[]) => success(...args)
}))

import { addUser, listUsers } from "./user.controller"

describe("user controller", () => {
  beforeEach(() => jest.clearAllMocks())

  it("lists users through the success helper", async () => {
    const response = {} as Response
    getUsers.mockResolvedValue([{ id: "1", name: "User", email: "user@example.com" }])

    await listUsers({} as never, response, jest.fn())

    expect(success).toHaveBeenCalledWith(response, [{ id: "1", name: "User", email: "user@example.com" }])
  })

  it("creates a user and responds with 201", async () => {
    const response = {} as Response
    createUser.mockResolvedValue({ id: "1", name: "User", email: "user@example.com" })

    await addUser({ body: { name: " User ", email: "USER@example.com" } } as never, response, jest.fn())

    expect(createUser).toHaveBeenCalledWith({ name: " User ", email: "USER@example.com" })
    expect(success).toHaveBeenCalledWith(response, { id: "1", name: "User", email: "user@example.com" }, 201)
  })

  it("passes validation errors to next", async () => {
    const next = jest.fn()

    await addUser({ body: { name: "", email: "" } } as never, {} as Response, next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, message: "Name and email are required" }))
  })
})
