import { render, screen } from "@testing-library/react"
import CompletionRing from "./CompletionRing"

describe("CompletionRing", () => {
  it("shows completion percentage from completed statuses", () => {
    render(
      <CompletionRing
        tasks={[
          { id: "1", title: "One", status: "done", priority: "medium" },
          { id: "2", title: "Two", status: "todo", priority: "medium" }
        ]}
        statuses={[
          { id: "todo", label: "Todo", color: "#64748b", category: "pending", system: true },
          { id: "done", label: "Done", color: "#22c55e", category: "completed", system: true }
        ]}
      />
    )

    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
  })
})
