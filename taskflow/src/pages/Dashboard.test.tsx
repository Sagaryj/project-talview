import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Dashboard from "./Dashboard"

const addTask = jest.fn()

jest.mock("react-intl", () => ({
  useIntl: () => ({
    locale: "en",
    formatMessage: ({ id }: { id: string }) => {
      const messages: Record<string, string> = {
        dashboard: "Dashboard",
        overview: "Overview",
        totalTasks: "Total Tasks",
        completed: "Completed",
        dueToday: "Due Today",
        overdue: "Overdue",
        projectCompletion: "Project Completion",
        currentTime: "Current Time",
        timeZoneLabel: "Time zone",
        focusToday: "Focus Today",
        noTasks: "No tasks",
        upcomingDeadlines: "Upcoming Deadlines",
        noDeadlines: "No deadlines",
        workloadIndicator: "Workload Indicator",
        quickAddTask: "Quick Add Task",
        taskTitlePlaceholder: "Task title",
        add: "Add",
        taskStatus: "Task Status",
        recentTasks: "Recent Tasks",
        activityFeed: "Activity Feed"
      }
      return messages[id] ?? id
    }
  })
}))

jest.mock("../features/kanban/useKanban", () => ({
  useKanban: () => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    return {
      tasks: [
        { id: "1", title: "Ship feature", status: "todo", priority: "high", dueDate: today },
        { id: "2", title: "Review copy", status: "done", priority: "low", dueDate: tomorrow },
        { id: "3", title: "Fix bug", status: "in-progress", priority: "medium", dueDate: yesterday },
        { id: "4", title: "Plan release", status: "todo", priority: "medium", dueDate: "" }
      ],
      activity: [{ id: "a1", message: "Task created", createdAt: today }],
      addTask
    }
  }
}))

jest.mock("../features/kanban/useWorkflow", () => ({
  useWorkflow: () => ({
    statuses: [
      { id: "todo", label: "Todo", color: "#64748b", category: "pending", system: true },
      { id: "in-progress", label: "In Progress", color: "#6366f1", category: "active", system: true },
      { id: "done", label: "Done", color: "#22c55e", category: "completed", system: true }
    ]
  })
}))

jest.mock("../hooks/useAuthSession", () => ({
  useAuthSession: () => ({ user: { timezone: "Asia/Kolkata" } })
}))

jest.mock("../hooks/useZonedTime", () => ({
  useZonedTime: () => ({
    toFormat: (format: string) => (format === "hh:mm:ss a" ? "10:30:00 AM" : "Apr 2, 2026")
  })
}))

jest.mock("../lib/timezone", () => ({
  normalizeTimezone: () => "Asia/Kolkata"
}))

jest.mock("../components/charts/StatusChart", () => () => <div>Status Chart</div>)
jest.mock("../components/ActivityFeed", () => ({ activity }: { activity: Array<{ id: string; message: string }> }) => (
  <div>Activity items: {activity.length}</div>
))

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders task stats, current time, and task sections", () => {
    render(<Dashboard />)

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Current Time")).toBeInTheDocument()
    expect(screen.getByText("10:30:00 AM")).toBeInTheDocument()
    expect(screen.getByText("Time zone: Asia/Kolkata")).toBeInTheDocument()
    expect(screen.getAllByText("Ship feature").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Review copy").length).toBeGreaterThan(0)
    expect(screen.getByText("Status Chart")).toBeInTheDocument()
    expect(screen.getByText("Activity items: 1")).toBeInTheDocument()
    expect(screen.getAllByText("4").length).toBeGreaterThan(0)
  })

  it("adds a task through the quick add form", async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    await user.type(screen.getByPlaceholderText("Task title"), "Write docs")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(addTask).toHaveBeenCalledWith("Write docs", "todo", "medium", [], "")
  })
})
