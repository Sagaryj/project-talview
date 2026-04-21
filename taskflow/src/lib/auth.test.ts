const mutate = jest.fn()
const query = jest.fn()

jest.mock("./apollo", () => ({
  apolloClient: {
    mutate: (...args: unknown[]) => mutate(...args),
    query: (...args: unknown[]) => query(...args)
  }
}))

jest.mock("../features/auth/graphql/mutations", () => ({
  LOGIN_MUTATION: "LOGIN_MUTATION",
  SIGNUP_MUTATION: "SIGNUP_MUTATION",
  START_SIGNUP_MUTATION: "START_SIGNUP_MUTATION",
  VERIFY_SIGNUP_MUTATION: "VERIFY_SIGNUP_MUTATION",
  UPDATE_CURRENT_USER_MUTATION: "UPDATE_CURRENT_USER_MUTATION"
}))

jest.mock("../features/auth/graphql/queries", () => ({
  CURRENT_USER_QUERY: "CURRENT_USER_QUERY"
}))

import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  fetchCurrentUser,
  getAuthSession,
  login,
  requireAuthSession,
  saveAuthSession,
  startSignup,
  updateCurrentUserProfile
} from "./auth"

describe("auth helpers", () => {
  const session = {
    token: "token",
    user: { id: 1, name: "Sagar", email: "sagar@example.com" }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    jest.spyOn(Date, "now").mockReturnValue(1_000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("saves and reads a valid auth session", () => {
    const listener = jest.fn()
    window.addEventListener(AUTH_SESSION_EVENT, listener)

    saveAuthSession(session)

    expect(getAuthSession()).toEqual({
      ...session,
      expiresAt: 3_601_000
    })
    expect(listener).toHaveBeenCalled()

    window.removeEventListener(AUTH_SESSION_EVENT, listener)
  })

  it("clears the auth session", () => {
    saveAuthSession(session)
    clearAuthSession()

    expect(getAuthSession()).toBeNull()
  })

  it("removes an expired auth session", () => {
    localStorage.setItem("taskflow-auth", JSON.stringify({
      ...session,
      expiresAt: 999
    }))

    expect(getAuthSession()).toBeNull()
    expect(localStorage.getItem("taskflow-auth")).toBeNull()
  })

  it("throws when a session is required but missing", () => {
    expect(() => requireAuthSession()).toThrow("You must be logged in to continue")
  })

  it("logs in through Apollo", async () => {
    mutate.mockResolvedValue({ data: { login: session } })

    await expect(login("sagar@example.com", "secret123")).resolves.toEqual(session)
    expect(mutate).toHaveBeenCalledWith({
      mutation: "LOGIN_MUTATION",
      variables: { email: "sagar@example.com", password: "secret123" }
    })
  })

  it("starts signup and returns the message", async () => {
    mutate.mockResolvedValue({ data: { startSignup: { message: "Verification code sent to email" } } })

    await expect(startSignup("Sagar", "sagar@example.com", "secret123")).resolves.toBe("Verification code sent to email")
  })

  it("fetches and normalizes the current user", async () => {
    saveAuthSession(session)
    query.mockResolvedValue({
      data: {
        users: [{
          id: 1,
          name: "Sagar",
          username: "sagar",
          email: "sagar@example.com",
          preferred_language: "en",
          theme: "dark",
          profile_role: "Member",
          company: "TaskFlow",
          timezone: "Asia/Kolkata"
        }]
      }
    })

    await expect(fetchCurrentUser()).resolves.toEqual({
      id: 1,
      name: "Sagar",
      username: "sagar",
      email: "sagar@example.com",
      preferredLanguage: "en",
      theme: "dark",
      profileRole: "Member",
      company: "TaskFlow",
      timezone: "Asia/Kolkata"
    })

    expect(getAuthSession()?.user.username).toBe("sagar")
  })

  it("maps duplicate username errors to the frontend-safe code", async () => {
    saveAuthSession(session)
    mutate.mockRejectedValue(new Error("duplicate key value violates unique constraint users_username_key"))

    await expect(
      updateCurrentUserProfile({
        name: "Sagar",
        username: "sagar",
        preferredLanguage: "en",
        theme: "dark",
        profileRole: "Member",
        company: "TaskFlow",
        timezone: "Asia/Kolkata"
      })
    ).rejects.toThrow("PROFILE_USERNAME_TAKEN")
  })
})
