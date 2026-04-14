import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import KanbanColumn from "./KanbanColumn"

jest.mock("./KanbanCard", () => (props: { task: { title: string } }) => <div>{props.task.title}</div>)
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, ...props }: React.HTMLAttributes<HTMLDivElement> & { layout?: boolean }) => {
      void layout
      return <div {...props}>{children}</div>
    }
  }
}))

describe("KanbanColumn", () => {
  const tasks = Array.from({ length: 6 }, (_, index) => ({
    id: String(index + 1),
    title: `Task ${index + 1}`,
    status: "todo",
    priority: "medium" as const
  }))

  function renderColumn() {
    const props = {
      title: "Todo",
      status: "todo",
      accentColor: "#64748b",
      tasks,
      moveTask: jest.fn(),
      onAddTask: jest.fn(),
      onDeleteTask: jest.fn(),
      reorderTask: jest.fn(),
      draggingId: null,
      setDraggingId: jest.fn(),
      updateTask: jest.fn(),
      setSelectedTask: jest.fn()
    }

    render(<KanbanColumn {...props} />)
    return props
  }

  it("adds tasks and paginates long columns", async () => {
    const user = userEvent.setup()
    const props = renderColumn()

    expect(screen.getByText("6 tasks")).toBeInTheDocument()
    expect(screen.getByText("Task 1")).toBeInTheDocument()
    expect(screen.queryByText("Task 6")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "+ Add" }))
    expect(props.onAddTask).toHaveBeenCalledWith("todo")

    await user.click(screen.getByRole("button", { name: "▶" }))
    expect(screen.getByText("Task 6")).toBeInTheDocument()
  })

  it("moves dropped tasks into the column", () => {
    const props = renderColumn()
    const column = screen.getByText("Todo").closest("div")?.parentElement?.parentElement as HTMLElement

    fireEvent.drop(column, { dataTransfer: { getData: () => "42" } })
    expect(props.moveTask).toHaveBeenCalledWith("42", "todo")
  })
})
