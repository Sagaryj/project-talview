import { act, render, screen, waitFor } from "@testing-library/react"

const getAuthSession = jest.fn()

jest.mock("../lib/auth", () => ({
  AUTH_SESSION_EVENT: "taskflow-auth-changed",
  getAuthSession: (...args: unknown[]) => getAuthSession(...args)
}))

import { AUTH_SESSION_EVENT } from "../lib/auth"
import { useAuthSession } from "./useAuthSession"

function SessionHarness() {
  const session = useAuthSession()
  return <span>{session?.user.name ?? "none"}</span>
}

describe("useAuthSession", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("reads the initial auth session and reacts to auth events", async () => {
    getAuthSession
      .mockReturnValueOnce({ token: "token", user: { id: 1, name: "Sagar", email: "sagar@example.com" } })
      .mockReturnValueOnce({ token: "token", user: { id: 1, name: "Updated", email: "sagar@example.com" } })

    render(<SessionHarness />)

    expect(screen.getByText("Sagar")).toBeInTheDocument()

    await act(async () => {
      window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
    })

    await waitFor(() => {
      expect(screen.getByText("Updated")).toBeInTheDocument()
    })
  })
})
