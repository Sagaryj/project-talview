import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TaskModal from '../src/features/kanban/TaskModal'

const meta = {
  title: 'Kanban/TaskModal',
  component: TaskModal,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof TaskModal>

export default meta

type Story = StoryObj<typeof meta>

function TaskModalHarness() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
        >
          Reopen modal
        </button>
      ) : null}

      {open ? (
        <TaskModal
          status="todo"
          onClose={() => setOpen(false)}
          onCreate={(title, status, priority, tags, dueDate, description) => {
            console.log({ title, status, priority, tags, dueDate, description })
            setOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

export const Default: Story = {
  render: () => <TaskModalHarness />
}
