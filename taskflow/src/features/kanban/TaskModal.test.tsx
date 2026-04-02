import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TaskModal from "./TaskModal"

describe("TaskModal", () => {
  it("creates a task with parsed tags and closes the modal", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    const onClose = jest.fn()
    const { container } = render(<TaskModal status="todo" onCreate={onCreate} onClose={onClose} />)

    const textboxes = screen.getAllByRole("textbox")
    const titleInput = textboxes[0]
    const tagsInput = textboxes[1]
    const descriptionInput = textboxes[2]
    const dueDateInput = container.querySelector('input[type="date"]') as HTMLInputElement

    await user.type(titleInput, "Write tests")
    await user.selectOptions(screen.getByRole("combobox"), "high")
    await user.type(tagsInput, "frontend, jest,  qa ")
    await user.type(dueDateInput, "2026-04-10")
    await user.type(descriptionInput, "Cover modal submission")
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).toHaveBeenCalledWith(
      "Write tests",
      "todo",
      "high",
      ["frontend", "jest", "qa"],
      "2026-04-10",
      "Cover modal submission"
    )
    expect(onClose).toHaveBeenCalled()
  })

  it("does not create a task when the title is empty", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    const onClose = jest.fn()

    render(<TaskModal status="todo" onCreate={onCreate} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
