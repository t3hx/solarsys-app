import { defineConfig, devices } from '@playwright/test'

const port = 4177

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // * Chaque page precharge ~1,9 Go de textures : plus de workers fait crasher le navigateur
  // * en local, et le runner CI (rendu logiciel) ne tient meme pas deux pages de front
  workers: process.env.CI ? 1 : 2,
  // * Prechargement complet a chaque page : large marge sur le runner CI sans GPU
  timeout: process.env.CI ? 120_000 : 30_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    actionTimeout: process.env.CI ? 30_000 : 0,
  },
  expect: { timeout: process.env.CI ? 15_000 : 5_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `VITE_EXPOSE_DEBUG_API=1 pnpm build && pnpm preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
