import type { Meta, StoryObj } from '@storybook/react-vite'
import CompletionRing from '../src/components/charts/CompletionRing'

const statuses = [
  { id: 'todo', label: 'Todo', color: '#64748b', category: 'pending' as const, system: true },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6', category: 'active' as const, system: true },
  { id: 'done', label: 'Done', color: '#22c55e', category: 'completed' as const, system: true }
]

const meta = {
  title: 'Charts/CompletionRing',
  component: CompletionRing,
  args: {
    statuses,
    tasks: [
      { id: '1', title: 'Design dashboard', status: 'done', priority: 'high' as const },
      { id: '2', title: 'Write docs', status: 'done', priority: 'medium' as const },
      { id: '3', title: 'Fix topbar overflow', status: 'in-progress', priority: 'medium' as const },
      { id: '4', title: 'Plan release', status: 'todo', priority: 'low' as const }
    ]
  }
} satisfies Meta<typeof CompletionRing>

export default meta

type Story = StoryObj<typeof meta>

export const HalfDone: Story = {}

export const Empty: Story = {
  args: {
    tasks: []
  }
}

export const FullyDone: Story = {
  args: {
    tasks: [
      { id: '1', title: 'Design dashboard', status: 'done', priority: 'high' as const },
      { id: '2', title: 'Write docs', status: 'done', priority: 'medium' as const }
    ]
  }
}
