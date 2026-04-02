import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TaskDetailsModal from "./TaskDetailsModal"

describe("TaskDetailsModal", () => {
  const task = {
    id: "1",
    title: "Write docs",
    status: "todo",
    priority: "medium" as const,
    dueDate: "2026-04-10",
    tags: ["frontend", "docs"],
    description: "Initial draft"
  }

  const statuses = [
    { id: "todo", label: "Todo", color: "#64748b", category: "pending" as const, system: true },
    { id: "done", label: "Done", color: "#22c55e", category: "completed" as const, system: true }
  ]

  it("saves edited task fields and closes", async () => {
    const user = userEvent.setup()
    const updateTask = jest.fn()
    const updateStatus = jest.fn()
    const updatePriority = jest.fn()
    const updateDueDate = jest.fn()
    const updateTags = jest.fn()
    const updateDescription = jest.fn()
    const onClose = jest.fn()
    const { container } = render(
      <TaskDetailsModal
        task={task}
        statuses={statuses}
        updateTask={updateTask}
        updateStatus={updateStatus}
        updatePriority={updatePriority}
        onClose={onClose}
        updateDueDate={updateDueDate}
        updateTags={updateTags}
        updateDescription={updateDescription}
      />
    )

    const textboxes = screen.getAllByRole("textbox")
    await user.clear(textboxes[0])
    await user.type(textboxes[0], "Write better docs")
    await user.selectOptions(screen.getAllByRole("combobox")[0], "done")
    await user.selectOptions(screen.getAllByRole("combobox")[1], "high")
    await user.clear(textboxes[1])
    await user.type(textboxes[1], "frontend, release")
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    await user.clear(dateInput)
    await user.type(dateInput, "2026-04-12")
    await user.clear(textboxes[2])
    await user.type(textboxes[2], "Final draft")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(updateTask).toHaveBeenCalledWith("1", "Write better docs")
    expect(updateStatus).toHaveBeenCalledWith("1", "done")
    expect(updatePriority).toHaveBeenCalledWith("1", "high")
    expect(updateDueDate).toHaveBeenCalledWith("1", "2026-04-12")
    expect(updateTags).toHaveBeenCalledWith("1", ["frontend", "release"])
    expect(updateDescription).toHaveBeenCalledWith("1", "Final draft")
    expect(onClose).toHaveBeenCalled()
  })
})
