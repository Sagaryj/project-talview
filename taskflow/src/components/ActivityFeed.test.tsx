import { render, screen } from "@testing-library/react"
import ActivityFeed from "./ActivityFeed"

describe("ActivityFeed", () => {
  it("renders at most five activity items", () => {
    const activity = Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      message: `Item ${index + 1}`,
      timestamp: new Date(`2026-04-0${(index % 5) + 1}T10:00:00.000Z`).getTime()
    }))

    render(<ActivityFeed activity={activity} />)

    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 5")).toBeInTheDocument()
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument()
  })
})
