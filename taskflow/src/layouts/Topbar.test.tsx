import type { HTMLAttributes, ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import Topbar from "./Topbar"

const setTheme = jest.fn()
const clearAuthSession = jest.fn()
const navigateMock = jest.fn()

jest.mock("../hooks/useTheme", () => ({
  useTheme: () => ({ theme: "dark", setTheme })
}))

jest.mock("../hooks/useAuthSession", () => ({
  useAuthSession: () => ({ user: { id: 1, name: "Sagar", email: "sagar@example.com", timezone: "Asia/Kolkata" } })
}))

jest.mock("../hooks/useZonedTime", () => ({
  useZonedTime: () => ({
    toFormat: (format: string) => (format === "hh:mm:ss a" ? "10:30:00 AM" : "Apr 2, 2026")
  })
}))

jest.mock("../lib/timezone", () => ({
  normalizeTimezone: () => "Asia/Kolkata"
}))

jest.mock("../lib/auth", () => ({
  clearAuthSession: () => clearAuthSession()
}))

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigateMock
}))

jest.mock("react-intl", () => ({
  useIntl: () => ({
    locale: "en",
    formatMessage: ({ id }: { id: string }) => {
      const messages: Record<string, string> = {
        welcomeBack: "Welcome Back",
        search: "Search...",
        changePassword: "Change Password",
        faq: "FAQ",
        logout: "Logout"
      }
      return messages[id] ?? id
    }
  })
}))

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
  }
}))

describe("Topbar", () => {
  beforeEach(() => jest.clearAllMocks())

  it("renders the welcome text and zoned time", () => {
    render(
      <MemoryRouter>
        <Topbar toggleDesktop={jest.fn()} toggleMobile={jest.fn()} openCommand={jest.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByText((content) => content.includes("Welcome Back") && content.includes("Sagar"))).toBeInTheDocument()
    expect(screen.getByText("10:30:00 AM")).toBeInTheDocument()
    expect(screen.getByText(/Apr 2, 2026 • Asia\/Kolkata/i)).toBeInTheDocument()
  })

  it("toggles theme and logs out through the menu", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Topbar toggleDesktop={jest.fn()} toggleMobile={jest.fn()} openCommand={jest.fn()} />
      </MemoryRouter>
    )

    await user.click(screen.getAllByRole("button")[2])
    expect(setTheme).toHaveBeenCalledWith("light")

    await user.click(screen.getAllByRole("button")[3])
    await user.click(screen.getByRole("button", { name: "Logout" }))

    expect(clearAuthSession).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith("/login")
  })
})
