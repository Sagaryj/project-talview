import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useTheme } from "./useTheme"

function ThemeHarness() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <span>{theme}</span>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>toggle</button>
    </div>
  )
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })

  it("defaults to dark theme and persists updates", async () => {
    const user = userEvent.setup()
    render(<ThemeHarness />)

    expect(screen.getByText("dark")).toBeInTheDocument()
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    await user.click(screen.getByRole("button", { name: "toggle" }))

    expect(screen.getByText("light")).toBeInTheDocument()
    expect(localStorage.getItem("theme")).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})
