import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import Login from "./Login"

const navigateMock = jest.fn()
const getAuthSession = jest.fn()
const login = jest.fn()
const saveAuthSession = jest.fn()
const startSignup = jest.fn()
const verifySignup = jest.fn()

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigateMock
}))

jest.mock("../lib/auth", () => ({
  getAuthSession: (...args: unknown[]) => getAuthSession(...args),
  login: (...args: unknown[]) => login(...args),
  saveAuthSession: (...args: unknown[]) => saveAuthSession(...args),
  signup: jest.fn(),
  startSignup: (...args: unknown[]) => startSignup(...args),
  verifySignup: (...args: unknown[]) => verifySignup(...args)
}))

describe("Login page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAuthSession.mockReturnValue(null)
  })

  it("renders login mode by default", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument()
    expect(screen.getByLabelText("Email address")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })

  it("moves signup into OTP verification step after startSignup succeeds", async () => {
    const user = userEvent.setup()
    startSignup.mockResolvedValue("Verification code sent to email")

    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText("Full name"), "Sagar")
    await user.type(screen.getByLabelText("Email address"), "sagar@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /send verification code/i }))

    await waitFor(() => {
      expect(startSignup).toHaveBeenCalledWith("Sagar", "sagar@example.com", "secret123")
    })

    expect(await screen.findByLabelText("Verification code")).toBeInTheDocument()
    expect(screen.getByText("Verification code sent to email")).toBeInTheDocument()
  })

  it("logs in and navigates to dashboard", async () => {
    const user = userEvent.setup()
    login.mockResolvedValue({ token: "token", user: { id: 1, name: "Sagar", email: "sagar@example.com" } })

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText("Email address"), "sagar@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /continue to dashboard/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("sagar@example.com", "secret123")
      expect(saveAuthSession).toHaveBeenCalledWith({ token: "token", user: { id: 1, name: "Sagar", email: "sagar@example.com" } })
      expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })
  })
})
