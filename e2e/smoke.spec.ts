import { expect, test } from '@playwright/test'

test('the app loads and shows the product name', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/solarsys/i)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/solarsys/i)
})
