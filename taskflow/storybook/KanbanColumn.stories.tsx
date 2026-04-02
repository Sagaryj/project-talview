import type { Meta, StoryObj } from '@storybook/react-vite'
import KanbanColumn from '../src/features/kanban/KanbanColumn'
import { sampleTasks } from './mocks'

const meta = {
  title: 'Kanban/KanbanColumn',
  component: KanbanColumn,
  args: {
    title: 'Todo',
    status: 'todo',
    accentColor: '#64748b',
    tasks: sampleTasks.filter((task) => task.status === 'todo'),
    moveTask: () => undefined,
    onAddTask: () => undefined,
    onDeleteTask: () => undefined,
    reorderTask: () => undefined,
    draggingId: null,
    setDraggingId: () => undefined,
    updateTask: () => undefined,
    setSelectedTask: () => undefined
  }
} satisfies Meta<typeof KanbanColumn>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongList: Story = {
  args: {
    tasks: Array.from({ length: 7 }, (_, index) => ({
      id: String(index + 1),
      title: `Task ${index + 1}`,
      status: 'todo',
      priority: (index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      dueDate: '2099-04-10',
      tags: ['story']
    }))
  }
}
