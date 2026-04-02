import { act, renderHook, waitFor } from "@testing-library/react"
import { useKanban } from "./useKanban"

const createActivity = jest.fn()
const createTask = jest.fn()
const deleteTaskById = jest.fn()
const fetchActivities = jest.fn()
const fetchTasks = jest.fn()
const fetchWorkflowStatuses = jest.fn()
const moveTaskWithActivityLog = jest.fn()
const reorderTasks = jest.fn()
const replaceTaskTags = jest.fn()
const subscribeToActivities = jest.fn()
const subscribeToTasks = jest.fn()
const updateTaskFields = jest.fn()

jest.mock("./hasura", () => ({
  createActivity: (...args: unknown[]) => createActivity(...args),
  createTask: (...args: unknown[]) => createTask(...args),
  deleteTask: (...args: unknown[]) => deleteTaskById(...args),
  fetchActivities: (...args: unknown[]) => fetchActivities(...args),
  fetchTasks: (...args: unknown[]) => fetchTasks(...args),
  fetchWorkflowStatuses: (...args: unknown[]) => fetchWorkflowStatuses(...args),
  moveTaskWithActivityLog: (...args: unknown[]) => moveTaskWithActivityLog(...args),
  reorderTasks: (...args: unknown[]) => reorderTasks(...args),
  replaceTaskTags: (...args: unknown[]) => replaceTaskTags(...args),
  subscribeToActivities: (...args: unknown[]) => subscribeToActivities(...args),
  subscribeToTasks: (...args: unknown[]) => subscribeToTasks(...args),
  updateTaskFields: (...args: unknown[]) => updateTaskFields(...args)
}))

describe("useKanban", () => {
  const unsubscribeTasks = jest.fn()
  const unsubscribeActivities = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    fetchTasks.mockResolvedValue([
      { id: "1", title: "One", status: "todo", priority: "medium", tags: [] },
      { id: "2", title: "Two", status: "todo", priority: "high", tags: [] }
    ])
    fetchActivities.mockResolvedValue([{ id: "a1", message: "Loaded", timestamp: 1 }])
    fetchWorkflowStatuses.mockResolvedValue([
      { id: "todo", dbId: "10", label: "Todo", color: "#64748b", category: "pending", system: true },
      { id: "done", dbId: "11", label: "Done", color: "#22c55e", category: "completed", system: true }
    ])
    subscribeToTasks.mockReturnValue({ unsubscribe: unsubscribeTasks })
    subscribeToActivities.mockReturnValue({ unsubscribe: unsubscribeActivities })
    createTask.mockResolvedValue("99")
  })

  it("loads tasks and activities on mount", async () => {
    const { result } = renderHook(() => useKanban())

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2)
      expect(result.current.activity).toHaveLength(1)
    })
  })

  it("adds a task through the Hasura helpers and logs activity", async () => {
    const { result } = renderHook(() => useKanban())

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2)
    })

    await act(async () => {
      await result.current.addTask("Write tests", "todo", "medium", ["frontend"], "2026-04-10", "Add coverage")
    })

    expect(createTask).toHaveBeenCalledWith({
      title: "Write tests",
      statusDbId: "10",
      priority: "medium",
      tags: ["frontend"],
      dueDate: "2026-04-10",
      description: "Add coverage",
      position: 2
    })
    expect(createActivity).toHaveBeenCalledWith('Task "Write tests" created', "99")
  })

  it("cleans up subscriptions on unmount", () => {
    const { unmount } = renderHook(() => useKanban())

    unmount()

    expect(unsubscribeTasks).toHaveBeenCalled()
    expect(unsubscribeActivities).toHaveBeenCalled()
  })
})
