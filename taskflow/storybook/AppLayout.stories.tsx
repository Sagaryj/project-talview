import type { Meta, StoryObj } from '@storybook/react-vite'
import { Routes, Route } from 'react-router-dom'
import AppLayout from '../src/layouts/AppLayout'
import { clearAuthSession } from '../src/lib/auth'

const meta = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => {
      clearAuthSession()
      return <Story />
    }
  ]
} satisfies Meta<typeof AppLayout>

export default meta

type Story = StoryObj<typeof meta>

export const Unauthenticated: Story = {
  render: () => (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="*" element={<div className="p-8">Protected content</div>} />
      </Route>
    </Routes>
  )
}
