import type { Meta, StoryObj } from '@storybook/react-vite'
import ActivityFeed from '../src/components/ActivityFeed'

const meta = {
  title: 'Components/ActivityFeed',
  component: ActivityFeed,
  args: {
    activity: [
      { id: '1', message: 'Created landing page tasks', timestamp: new Date('2026-04-02T09:00:00').getTime() },
      { id: '2', message: 'Moved API docs to In Progress', timestamp: new Date('2026-04-02T10:30:00').getTime() },
      { id: '3', message: 'Completed release checklist', timestamp: new Date('2026-04-02T12:15:00').getTime() }
    ]
  }
} satisfies Meta<typeof ActivityFeed>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BusyDay: Story = {
  args: {
    activity: Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      message: `Activity item ${index + 1}`,
      timestamp: new Date(`2026-04-02T${String(9 + index).padStart(2, '0')}:00:00`).getTime()
    }))
  }
}
