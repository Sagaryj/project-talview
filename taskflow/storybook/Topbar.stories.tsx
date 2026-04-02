import type { Meta, StoryObj } from '@storybook/react-vite'
import Topbar from '../src/layouts/Topbar'
import { saveAuthSession } from '../src/lib/auth'

const meta = {
  title: 'Layout/Topbar',
  component: Topbar,
  args: {
    toggleDesktop: () => undefined,
    toggleMobile: () => undefined,
    openCommand: () => undefined
  },
  decorators: [
    (Story) => {
      saveAuthSession({
        token: 'storybook-token',
        user: {
          id: 1,
          name: 'Sagar',
          email: 'sagar@example.com',
          timezone: 'Asia/Kolkata'
        }
      })

      return <Story />
    }
  ]
} satisfies Meta<typeof Topbar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
