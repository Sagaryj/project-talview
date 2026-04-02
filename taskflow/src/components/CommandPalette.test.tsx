import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CommandPalette from "./CommandPalette"

const navigateMock = jest.fn()
const useKanban = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock
}))

jest.mock("../features/kanban/useKanban", () => ({
  useKanban: () => useKanban()
}))

describe("CommandPalette", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useKanban.mockReturnValue({ tasks: [{ id: "1", title: "Ship feature" }] })
  })

  it("returns null when closed", () => {
    const { container } = render(<CommandPalette open={false} onClose={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it("filters commands and navigates when a result is selected", async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(<CommandPalette open onClose={onClose} />)

    await user.type(screen.getByPlaceholderText("Search commands..."), "profile")
    await user.click(screen.getByRole("button", { name: "Go to Profile" }))

    expect(navigateMock).toHaveBeenCalledWith("/profile")
    expect(onClose).toHaveBeenCalled()
  })

  it("shows empty state when there are no matching results", async () => {
    const user = userEvent.setup()
    render(<CommandPalette open onClose={jest.fn()} />)

    await user.type(screen.getByPlaceholderText("Search commands..."), "zzzz")

    expect(screen.getByText("No results found")).toBeInTheDocument()
  })
})
