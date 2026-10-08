import { defineConfig } from '@playwright/test'
import config from './playwright.config.js'

const baseURL =
  process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/scottsiegel/'

export default defineConfig({
  ...config,
  use: { ...config.use, baseURL },
  webServer: {
    command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run preview -- --host 127.0.0.1 --port 4173 --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
  },
})
