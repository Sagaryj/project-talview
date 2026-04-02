import type { Meta, StoryObj } from '@storybook/react-vite'
import StatusChart from '../src/components/charts/StatusChart'
import { sampleTasks, workflowStatuses } from './mocks'

const meta = {
  title: 'Charts/StatusChart',
  component: StatusChart,
  args: {
    tasks: sampleTasks,
    statuses: workflowStatuses
  }
} satisfies Meta<typeof StatusChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
