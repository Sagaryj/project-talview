import type { Meta, StoryObj } from '@storybook/react-vite'
import PriorityChart from '../src/components/charts/PriorityChart'
import { sampleTasks } from './mocks'

const meta = {
  title: 'Charts/PriorityChart',
  component: PriorityChart,
  args: {
    tasks: sampleTasks
  }
} satisfies Meta<typeof PriorityChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
