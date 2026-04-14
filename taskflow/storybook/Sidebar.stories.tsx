import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Sidebar from '../src/layouts/Sidebar'

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj

function SidebarHarness({ collapsed = false, mobileOpen = true }: { collapsed?: boolean; mobileOpen?: boolean }) {
  const [isCollapsed, setCollapsed] = useState(collapsed)
  const [isMobileOpen, setMobileOpen] = useState(mobileOpen)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Sidebar
        collapsed={isCollapsed}
        mobileOpen={isMobileOpen}
        setCollapsed={setCollapsed}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} p-8`}>
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">
          Sidebar playground area
        </div>
      </div>
    </div>
  )
}

export const Expanded: Story = {
  render: () => <SidebarHarness collapsed={false} mobileOpen />
}

export const Collapsed: Story = {
  render: () => <SidebarHarness collapsed mobileOpen />
}
