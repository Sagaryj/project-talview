import { defineConfig } from 'cypress'

export default defineConfig({
  allowCypressEnv: false,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true
  },
  e2e: {
    baseUrl: 'http://localhost:5173/project-talview',
    setupNodeEvents() {}
  },
  video: true,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  retries:2,
  screenshotOnRunFailure: true,
  viewportHeight: 800,
  viewportWidth: 1280,
  
  
})
