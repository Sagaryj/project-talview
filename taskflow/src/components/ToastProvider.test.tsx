import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToastProvider } from "./ToastProvider"
import { useToast } from "./toast-context"

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
  }
}))

jest.mock("lucide-react", () => ({
  AlertTriangle: () => <span>warning-icon</span>,
  CheckCircle2: () => <span>success-icon</span>,
  X: () => <span>x</span>
}))

function Harness() {
  const { showToast } = useToast()

  return (
    <div>
      <button onClick={() => showToast("Saved", "success")}>Show Success</button>
      <button onClick={() => showToast("Careful", "warning")}>Show Warning</button>
    </div>
  )
}

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(global.crypto, "randomUUID").mockReturnValue("123e4567-e89b-12d3-a456-426614174000")
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it("shows and dismisses toast messages", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    )

    await user.click(screen.getByRole("button", { name: "Show Success" }))
    expect(screen.getByText("Saved")).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(3200)
    })

    expect(screen.queryByText("Saved")).not.toBeInTheDocument()
  })
})
