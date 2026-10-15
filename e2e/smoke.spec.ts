import { expect, test } from '@playwright/test'

test('the app loads, shows the product name and mounts the 3D scene', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page).toHaveTitle(/solarsys/i)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/solarsys/i)
  await expect(page.locator('canvas')).toBeVisible()
  // * La scene est prete une fois les textures chargees et le Suspense resolu
  await expect(page.locator('[data-scene-ready="true"]')).toBeAttached({ timeout: 60_000 })
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(errors).toEqual([])
})
