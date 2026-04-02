import { createUser, getUsers } from "./user.service"

describe("user service", () => {
  it("creates a normalized user and stores it in memory", async () => {
    const user = await createUser({ name: " Alice ", email: "ALICE@example.com" })

    expect(user.name).toBe("Alice")
    expect(user.email).toBe("alice@example.com")
    expect(user.id).toEqual(expect.any(String))
  })

  it("returns created users", async () => {
    const users = await getUsers()

    expect(users.length).toBeGreaterThan(0)
  })
})
