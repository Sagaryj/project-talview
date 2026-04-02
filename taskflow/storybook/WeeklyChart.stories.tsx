import type { Meta, StoryObj } from '@storybook/react-vite'
import WeeklyChart from '../src/components/charts/WeeklyChart'
import { sampleTasks, workflowStatuses } from './mocks'

const meta = {
  title: 'Charts/WeeklyChart',
  component: WeeklyChart,
  args: {
    tasks: sampleTasks,
    statuses: workflowStatuses
  }
} satisfies Meta<typeof WeeklyChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
