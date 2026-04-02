import type { Meta, StoryObj } from '@storybook/react-vite'
import TagChart from '../src/components/charts/TagChart'
import { sampleTasks } from './mocks'

const meta = {
  title: 'Charts/TagChart',
  component: TagChart,
  args: {
    tasks: sampleTasks
  }
} satisfies Meta<typeof TagChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
