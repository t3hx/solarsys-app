import { expect, test, type Page } from '@playwright/test'

// * Vu uniquement dans le contexte navigateur de page.evaluate (la config e2e n'a pas la lib DOM)
declare const window: {
  solarsys?: { select(id: string | null): void }
}

// * Parcours utilisateur de la checklist de parite (plan §6 phase 9) : clic planete,
// * focus et sortie, fenetre info, changement de langue, vue tactique.
// * Le tutoriel est marque comme vu avant chaque chargement pour arriver direct en scene.

async function openScene(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('solarsys_tutorial_seen', '1')
  })
  await page.goto('/')
  await expect(page.locator('[data-scene-ready="true"]')).toBeAttached({ timeout: 60_000 })
}

/** Selectionne un corps via l'API de debug exposee par le build de test */
async function select(page: Page, id: string) {
  await page.evaluate((bodyId) => window.solarsys!.select(bodyId), id)
}

test('clicking the Sun on the canvas selects and focuses it', async ({ page }) => {
  await openScene(page)
  // * Camera initiale sur l'origine : le Soleil est au centre du viewport
  const canvas = page.locator('canvas')
  const box = (await canvas.boundingBox())!
  await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } })

  await expect(page.getByTestId('target-name')).toHaveText('THE SUN')
  await expect(page.getByTestId('focus-ui')).toBeVisible()
})

test('focusing a body shows the focus UI and Space exits it', async ({ page }) => {
  await openScene(page)
  await select(page, 'earth')

  await expect(page.getByTestId('target-name')).toHaveText('EARTH')
  const focusUi = page.getByTestId('focus-ui')
  await expect(focusUi).toBeVisible()
  await expect(focusUi.getByText(/press space to exit/i)).toBeVisible()

  await page.keyboard.press('Space')
  await expect(focusUi).toBeHidden()
})

test('the info window opens from the focus UI and closes', async ({ page }) => {
  await openScene(page)
  await select(page, 'earth')

  await page.getByRole('button', { name: /want to know more/i }).click()
  const dialog = page.getByRole('dialog', { name: 'Earth' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('tab', { name: 'Analysis' })).toBeVisible()
  await expect(dialog.getByRole('tab', { name: 'Fun Facts' })).toBeVisible()
  await expect(dialog.getByTestId('body-description')).not.toBeEmpty()

  await dialog.getByRole('button', { name: /close/i }).click()
  await expect(dialog).toBeHidden()
})

test('switching the language updates the HUD instantly and persists', async ({ page }) => {
  await openScene(page)
  await expect(page.getByText('TACTICAL', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'FR', exact: true }).click()
  await expect(page.getByText('TACTIQUE', { exact: true })).toBeVisible()

  // * Le choix persiste (localStorage) apres rechargement
  await page.reload()
  await expect(page.locator('[data-scene-ready="true"]')).toBeAttached({ timeout: 60_000 })
  await expect(page.getByText('TACTIQUE', { exact: true })).toBeVisible()
})

test('the tactical view toggles from its corner button and Space exits it', async ({ page }) => {
  await openScene(page)
  const tacticalButton = page.getByRole('button', { name: 'Tactical view' })
  await expect(tacticalButton).toHaveAttribute('aria-pressed', 'false')

  await tacticalButton.click()
  await expect(tacticalButton).toHaveAttribute('aria-pressed', 'true')

  // * La montee dure 2 s ; Espace restaure ensuite la vue precedente
  await page.keyboard.press('Space')
  await expect(tacticalButton).toHaveAttribute('aria-pressed', 'false', { timeout: 10_000 })
})
