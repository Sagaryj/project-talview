import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import KanbanCard from "./KanbanCard"

const showToast = jest.fn()

jest.mock("../../components/toast-context", () => ({
  useToast: () => ({ showToast })
}))

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
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

  it("confirms delete, deletes, and shows toast", async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    jest.spyOn(window, "confirm").mockReturnValue(true)

    render(
      <KanbanCard
        task={task}
        onDelete={onDelete}
        setDraggingId={jest.fn()}
        updateTask={jest.fn()}
        setSelectedTask={jest.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "✕" }))
    expect(onDelete).toHaveBeenCalledWith("1")
    expect(showToast).toHaveBeenCalledWith('Deleted "Write docs"', "success")
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
