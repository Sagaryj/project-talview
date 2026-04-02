import { fireEvent, render, screen } from "@testing-library/react"
import AppLayout from "./AppLayout"

const getAuthSession = jest.fn()
let locationPathname = "/dashboard"

jest.mock("../lib/auth", () => ({
  getAuthSession: (...args: unknown[]) => getAuthSession(...args)
}))

jest.mock("./Sidebar", () => (props: { collapsed: boolean }) => <div>Sidebar:{String(props.collapsed)}</div>)
jest.mock("./Topbar", () => (props: { openCommand: () => void }) => (
  <button onClick={props.openCommand}>Open Command</button>
))
jest.mock("../components/CommandPalette", () => (props: { open: boolean }) => (
  <div>{props.open ? "Command Palette Open" : "Command Palette Closed"}</div>
))

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
  }
}))

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }: { to: string }) => <div>Navigate:{to}</div>,
  Outlet: () => <div>Outlet Content</div>,
  useLocation: () => ({ pathname: locationPathname })
}))

describe("AppLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    locationPathname = "/dashboard"
  })

  it("redirects to login when there is no auth session", () => {
    getAuthSession.mockReturnValue(null)

    render(<AppLayout />)

    expect(screen.getByText("Navigate:/login")).toBeInTheDocument()
  })

  it("renders the app shell and toggles the command palette with ctrl+k", () => {
    getAuthSession.mockReturnValue({ token: "token" })

    render(<AppLayout />)

    expect(screen.getByText("Outlet Content")).toBeInTheDocument()
    expect(screen.getByText("Command Palette Closed")).toBeInTheDocument()

    fireEvent.keyDown(window, { key: "k", ctrlKey: true })

    expect(screen.getByText("Command Palette Open")).toBeInTheDocument()
  })
})
