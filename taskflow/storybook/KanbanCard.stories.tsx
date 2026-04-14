import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import KanbanCard from '../src/features/kanban/KanbanCard'
import type { Task } from '../src/features/kanban/types'

const meta = {
  title: 'Kanban/KanbanCard',
  component: KanbanCard,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof KanbanCard>

export default meta

type Story = StoryObj

function KanbanCardHarness({ task }: { task: Task }) {
  const [currentTask, setCurrentTask] = useState(task)

  return (
    <div className="w-[320px]">
      <KanbanCard
        task={currentTask}
        onDelete={(taskId) => {
          console.log('Delete task', taskId)
        }}
        setDraggingId={(id) => {
          console.log('Dragging task', id)
        }}
        updateTask={(_taskId, newTitle) => {
          setCurrentTask((prev) => ({ ...prev, title: newTitle }))
        }}
        setSelectedTask={(nextTask) => {
          console.log('Selected task', nextTask)
        }}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <KanbanCardHarness
      task={{
        id: 'task-1',
        title: 'Finalize onboarding copy',
        status: 'todo',
        priority: 'medium',
        dueDate: '2099-04-06',
        tags: ['copy', 'onboarding']
      }}
    />
  )
}

export const OverdueHighPriority: Story = {
  render: () => (
    <KanbanCardHarness
      task={{
        id: 'task-2',
        title: 'Fix release blocker',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2025-12-01',
        tags: ['release', 'urgent']
      }}
    />
  )
}
