import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import KanbanBoard from "./KanbanBoard"

const useKanban = jest.fn()
const useWorkflow = jest.fn()

jest.mock("./useKanban", () => ({
  useKanban: () => useKanban()
}))

jest.mock("./useWorkflow", () => ({
  useWorkflow: () => useWorkflow()
}))

jest.mock("./KanbanColumn", () => (props: {
  title: string
  tasks: Array<{ title: string }>
  onAddTask: (status: string) => void
  setSelectedTask: (task: { id: string; title: string; status: string; priority: "low" | "medium" | "high" }) => void
  status: string
}) => (
  <div>
    <div>{props.title}</div>
    <div data-testid={`tasks-${props.status}`}>{props.tasks.map((task) => task.title).join(",") || "none"}</div>
    <button onClick={() => props.onAddTask(props.status)}>Add To {props.title}</button>
    {props.tasks[0] ? (
      <button
        onClick={() =>
          props.setSelectedTask({
            id: "selected-task",
            title: props.tasks[0].title,
            status: props.status,
            priority: "medium"
          })
        }
      >
        Open {props.title} Task
      </button>
    ) : null}
  </div>
))

jest.mock("./TaskModal", () => (props: { status: string; onClose: () => void }) => (
  <div>
    <span>TaskModal:{props.status}</span>
    <button onClick={props.onClose}>Close Task Modal</button>
  </div>
))

jest.mock("./TaskDetailsModal", () => (props: { task: { title: string }; onClose: () => void }) => (
  <div>
    <span>TaskDetails:{props.task.title}</span>
    <button onClick={props.onClose}>Close Details</button>
  </div>
))

describe("KanbanBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useWorkflow.mockReturnValue({
      statuses: [
        { id: "todo", label: "Todo", color: "#64748b", category: "pending", system: true },
        { id: "in-progress", label: "In Progress", color: "#3b82f6", category: "active", system: true },
        { id: "done", label: "Done", color: "#22c55e", category: "completed", system: true }
      ]
    })
    useKanban.mockReturnValue({
      tasks: [
        { id: "1", title: "Design landing", status: "todo", priority: "high", tags: ["design"], dueDate: "2099-01-01" },
        { id: "2", title: "API docs", status: "in-progress", priority: "medium", tags: ["docs"], dueDate: "2099-01-02" },
        { id: "3", title: "Release prep", status: "done", priority: "low", tags: ["release"], dueDate: "2099-01-03" }
      ],
      moveTask: jest.fn(),
      addTask: jest.fn(),
      deleteTask: jest.fn(),
      reorderTask: jest.fn(),
      updateDescription: jest.fn(),
      draggingId: null,
      setDraggingId: jest.fn(),
      updateTask: jest.fn(),
      updatePriority: jest.fn(),
      updateDueDate: jest.fn(),
      updateTags: jest.fn()
    })
  })

  it("filters tasks by search text before passing them to columns", async () => {
    const user = userEvent.setup()

    render(<KanbanBoard />)

    expect(screen.getByTestId("tasks-todo")).toHaveTextContent("Design landing")
    expect(screen.getByTestId("tasks-in-progress")).toHaveTextContent("API docs")

    await user.type(screen.getByPlaceholderText("Search tasks..."), "docs")

    expect(screen.getByTestId("tasks-todo")).toHaveTextContent("none")
    expect(screen.getByTestId("tasks-in-progress")).toHaveTextContent("API docs")
    expect(screen.getByTestId("tasks-done")).toHaveTextContent("none")
  })

  it("opens the add task modal from the global add button and from a column", async () => {
    const user = userEvent.setup()

    render(<KanbanBoard />)

    await user.click(screen.getByRole("button", { name: "Add Task" }))
    expect(screen.getByText("TaskModal:todo")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close Task Modal" }))
    expect(screen.queryByText("TaskModal:todo")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add To In Progress" }))
    expect(screen.getByText("TaskModal:in-progress")).toBeInTheDocument()
  })

  it("opens task details when a column selects a task", async () => {
    const user = userEvent.setup()

    render(<KanbanBoard />)

    await user.click(screen.getByRole("button", { name: "Open Todo Task" }))
    expect(screen.getByText("TaskDetails:Design landing")).toBeInTheDocument()
  })
})
