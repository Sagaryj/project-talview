import type { Meta, StoryObj } from '@storybook/react-vite'
import AgingChart from '../src/components/charts/AgingChart'
import { sampleTasks, workflowStatuses } from './mocks'

const meta = {
  title: 'Charts/AgingChart',
  component: AgingChart,
  args: {
    tasks: sampleTasks,
    statuses: workflowStatuses
  }
} satisfies Meta<typeof AgingChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
