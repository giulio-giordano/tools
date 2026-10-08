import { test, expect } from '@playwright/test'

test('shows the tools home and the PDF merge entry', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('tools — strumenti digitali')
  await expect(page.getByRole('banner').getByText('tools')).toBeVisible()
  await expect(page.getByRole('banner').getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('banner').getByRole('combobox', { name: 'Lingua' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Strumenti disponibili')
  await expect(page.getByText('I tuoi file restano sul tuo dispositivo.', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('complementary').getByRole('link', { name: 'Unisci PDF' })).toBeVisible()
})

test('switches language and restores the saved choice', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Lingua' }).selectOption('en')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('tools — useful tools')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Available tools')

  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveValue('en')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Available tools')
})

test('explains local language storage on the privacy page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy')
  await expect(page.getByRole('heading', { name: 'Preferenza della lingua' })).toBeVisible()
  await expect(page.getByText(/toolbox\.locale/)).toBeVisible()

  await page.getByRole('combobox', { name: 'Lingua' }).selectOption('en')
  await expect(page.getByRole('heading', { name: 'Language preference' })).toBeVisible()
  await expect(page.getByText(/This site is hosted on GitHub Pages/)).toBeVisible()
})
