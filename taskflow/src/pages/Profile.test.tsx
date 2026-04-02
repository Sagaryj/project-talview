import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Profile from "./Profile"

const fetchCurrentUser = jest.fn()
const getAuthSession = jest.fn()
const updateCurrentUserProfile = jest.fn()

jest.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => {
      const messages: Record<string, string> = {
        profile: "Profile",
        manageProfile: "Manage your personal information",
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
        profileSaveButton: "Save Changes",
        profileSaving: "Saving...",
        usernameTaken: "Username already taken"
      }
      return messages[id] ?? id
    }
  })
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

describe("Profile", () => {
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
    getAuthSession.mockReturnValue({ token: "token", user: baseUser })
    fetchCurrentUser.mockResolvedValue(baseUser)
  })

  it("loads the current profile and saves it successfully", async () => {
    const user = userEvent.setup()
    updateCurrentUserProfile.mockResolvedValue(baseUser)

    render(<Profile />)

    expect(await screen.findByDisplayValue("Sagar")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Save Changes" }))

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

    render(<Profile />)

    await screen.findByDisplayValue("Sagar")
    await user.click(screen.getByRole("button", { name: "Save Changes" }))

    expect(await screen.findByText("Username already taken")).toBeInTheDocument()
  })
})
