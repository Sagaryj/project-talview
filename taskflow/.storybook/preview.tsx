import type { Preview } from '@storybook/react-vite'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import I18nProvider from '../src/i18n/provider'
import { ToastProvider } from '../src/components/ToastProvider'
import '../src/index.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <I18nProvider>
          <ToastProvider>
            <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-950">
              <Story />
            </div>
          </ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      test: 'todo'
    }
  }
}

export default preview
