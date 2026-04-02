import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Settings from "./Settings"

const fetchCurrentUser = jest.fn()
const getAuthSession = jest.fn()
const updateCurrentUserProfile = jest.fn()
const useWorkflow = jest.fn()

jest.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => {
      const messages: Record<string, string> = {
        settings: "Settings",
        manageProfile: "Manage your personal information",
        profile: "Profile",
        name: "Name",
        username: "Username",
        email: "Email",
        role: "Role",
        company: "Company",
        timezone: "Timezone",
        preferredLanguage: "Preferred Language",
        profileLoadFailed: "Failed to load profile",
        profileNameRequired: "Name is required",
        profileSaved: "Profile updated successfully",
        profileSaveFailed: "Unable to save profile",
        profileSaveButton: "Save Profile",
        profileSaving: "Saving...",
        usernameTaken: "Username already taken"
      }
      return messages[id] ?? id
    }
  })
}))

jest.mock("../features/kanban/useWorkflow", () => ({
  useWorkflow: () => useWorkflow()
}))

jest.mock("../lib/auth", () => ({
  fetchCurrentUser: (...args: unknown[]) => fetchCurrentUser(...args),
  getAuthSession: (...args: unknown[]) => getAuthSession(...args),
  updateCurrentUserProfile: (...args: unknown[]) => updateCurrentUserProfile(...args)
}))

jest.mock("../lib/timezone", () => ({
  getAvailableTimezones: () => ["Asia/Kolkata", "Asia/Tokyo"],
  normalizeTimezone: (value?: string) => value ?? "Asia/Kolkata"
}))

describe("Settings", () => {
  const baseUser = {
    id: 1,
    name: "Sagar",
    username: "sagar",
    email: "sagar@example.com",
    preferredLanguage: "en",
    theme: "dark",
    profileRole: "Developer",
    company: "TaskFlow",
    timezone: "Asia/Kolkata"
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      })
    })

    getAuthSession.mockReturnValue({ token: "token", user: baseUser })
    fetchCurrentUser.mockResolvedValue(baseUser)
    useWorkflow.mockReturnValue({
      statuses: [
        { id: "todo", label: "Todo", color: "#64748b", category: "pending", system: true },
        { id: "done", label: "Done", color: "#22c55e", category: "completed", system: true }
      ],
      addStatus: jest.fn(),
      removeStatus: jest.fn(),
      moveStatus: jest.fn(),
      resetStatuses: jest.fn()
    })
  })

  it("loads the profile and saves the current settings", async () => {
    const user = userEvent.setup()
    updateCurrentUserProfile.mockResolvedValue(baseUser)

    render(<Settings />)

    expect(await screen.findByDisplayValue("Sagar")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Save Profile" }))

    await waitFor(() => {
      expect(updateCurrentUserProfile).toHaveBeenCalledWith({
        name: "Sagar",
        username: "sagar",
        preferredLanguage: "en",
        theme: "dark",
        profileRole: "Developer",
        company: "TaskFlow",
        timezone: "Asia/Kolkata"
      })
    })

    expect(await screen.findByText("Profile updated successfully")).toBeInTheDocument()
  })

  it("shows a duplicate username error when the save fails for that reason", async () => {
    const user = userEvent.setup()
    updateCurrentUserProfile.mockRejectedValue(new Error("PROFILE_USERNAME_TAKEN"))

    render(<Settings />)

    await screen.findByDisplayValue("Sagar")
    await user.click(screen.getByRole("button", { name: "Save Profile" }))

    expect(await screen.findByText("Username already taken")).toBeInTheDocument()
  })
})
