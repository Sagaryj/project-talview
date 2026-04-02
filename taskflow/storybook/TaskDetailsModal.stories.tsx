import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TaskDetailsModal from '../src/features/kanban/TaskDetailsModal'
import { sampleTasks, workflowStatuses } from './mocks'

const meta = {
  title: 'Kanban/TaskDetailsModal',
  component: TaskDetailsModal,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof TaskDetailsModal>

export default meta

type Story = StoryObj<typeof meta>

function TaskDetailsHarness() {
  const [task, setTask] = useState(sampleTasks[1])

  return (
    <TaskDetailsModal
      task={task}
      statuses={workflowStatuses}
      updateTask={(taskId, newTitle) => {
        console.log('updateTask', taskId, newTitle)
        setTask((prev) => ({ ...prev, title: newTitle }))
      }}
      updateStatus={(taskId, status) => {
        console.log('updateStatus', taskId, status)
        setTask((prev) => ({ ...prev, status }))
      }}
      updatePriority={(taskId, priority) => {
        console.log('updatePriority', taskId, priority)
        setTask((prev) => ({ ...prev, priority }))
      }}
      updateDueDate={(taskId, dueDate) => {
        console.log('updateDueDate', taskId, dueDate)
        setTask((prev) => ({ ...prev, dueDate }))
      }}
      updateTags={(taskId, tags) => {
        console.log('updateTags', taskId, tags)
        setTask((prev) => ({ ...prev, tags }))
      }}
      updateDescription={(taskId, description) => {
        console.log('updateDescription', taskId, description)
        setTask((prev) => ({ ...prev, description }))
      }}
      onClose={() => {
        console.log('close details')
      }}
    />
  )
}

export const Default: Story = {
  render: () => <TaskDetailsHarness />
}
