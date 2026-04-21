import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import KanbanCard from "./KanbanCard"

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, ...props }: React.HTMLAttributes<HTMLDivElement> & { layout?: boolean }) => {
      void layout
      return <div {...props}>{children}</div>
    }
  }
}))

describe("KanbanCard", () => {
  const task = {
    id: "1",
    title: "Write docs",
    status: "todo",
    priority: "high" as const,
    dueDate: "2026-04-01",
    tags: ["docs", "frontend"]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("opens task details when clicked", async () => {
    const user = userEvent.setup()
    const setSelectedTask = jest.fn()

    render(
      <KanbanCard
        task={task}
        onDelete={jest.fn()}
        setDraggingId={jest.fn()}
        updateTask={jest.fn()}
        setSelectedTask={setSelectedTask}
      />
    )

    await user.click(screen.getByText("Write docs"))
    expect(setSelectedTask).toHaveBeenCalledWith(task)
  })

  it("requests delete when delete is clicked", async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()

    render(
      <KanbanCard
        task={task}
        onDelete={onDelete}
        setDraggingId={jest.fn()}
        updateTask={jest.fn()}
        setSelectedTask={jest.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Delete Write docs" }))
    expect(onDelete).toHaveBeenCalledWith("1")
  })

  it("starts dragging with the task id", () => {
    const setDraggingId = jest.fn()
    render(
      <KanbanCard
        task={task}
        onDelete={jest.fn()}
        setDraggingId={setDraggingId}
        updateTask={jest.fn()}
        setSelectedTask={jest.fn()}
      />
    )

    const draggable = screen.getByText("Write docs").closest("div[draggable='true']") as HTMLElement
    const setData = jest.fn()
    fireEvent.dragStart(draggable, { dataTransfer: { setData } })

    expect(setData).toHaveBeenCalledWith("taskId", "1")
    expect(setDraggingId).toHaveBeenCalledWith("1")
  })
})
