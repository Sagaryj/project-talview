import type { ComponentProps } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import Sidebar from "./Sidebar"

jest.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => {
      const messages: Record<string, string> = {
        dashboard: "Dashboard",
        projects: "Projects",
        calendar: "Calendar",
        analytics: "Analytics",
        settings: "Settings",
        profile: "Profile"
      }
      return messages[id] ?? id
    }
  })
}))

function renderSidebar(overrides: Partial<ComponentProps<typeof Sidebar>> = {}) {
  const props: ComponentProps<typeof Sidebar> = {
    collapsed: false,
    mobileOpen: true,
    setCollapsed: jest.fn(),
    setMobileOpen: jest.fn(),
    ...overrides
  }

  render(
    <MemoryRouter>
      <Sidebar {...props} />
    </MemoryRouter>
  )

  return props
}

describe("Sidebar", () => {
  it("shows navigation labels when expanded", () => {
    renderSidebar()

    expect(screen.getByText("TaskFlow")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Projects")).toBeInTheDocument()
  })

  it("hides text labels when collapsed", () => {
    renderSidebar({ collapsed: true })

    expect(screen.queryByText("TaskFlow")).not.toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })

  it("calls setMobileOpen(false) when the mobile close button is clicked", async () => {
    const user = userEvent.setup()
    const props = renderSidebar()

    await user.click(screen.getByRole("button", { name: "✕" }))

    expect(props.setMobileOpen).toHaveBeenCalledWith(false)
  })
})
