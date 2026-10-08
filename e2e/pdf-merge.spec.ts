import { readFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { expect, test, type Page } from '@playwright/test'

async function createPdfFile(name: string, width: number) {
  const document = await PDFDocument.create()
  document.addPage([width, width + 100])

  return {
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  }
}

async function openPdfTool(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Unisci PDF' }).first().click()
  await expect(page.getByRole('heading', { name: 'Unisci file PDF' })).toBeVisible()
  await expect(page.getByText(/(?:Strumento|Tool)\s+0?1/)).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Tutti gli strumenti' })).toHaveCount(0)
  await expect(
    page.getByText('I tuoi file restano sul tuo dispositivo: l’elaborazione avviene nel browser e i documenti non vengono caricati sui nostri server.'),
  ).toBeVisible()
}

test('requires two PDFs and lets the user remove and keyboard-reorder files', async ({ page }) => {
  await openPdfTool(page)
  const fileInput = page.locator('input[type="file"]')

  await fileInput.setInputFiles(await createPdfFile('first.pdf', 100))
  await expect(page.getByText('Seleziona almeno due file PDF per continuare.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unisci PDF' })).toBeDisabled()

  await fileInput.setInputFiles([
    await createPdfFile('second.pdf', 200),
    await createPdfFile('third.pdf', 300),
  ])
  const rows = page.locator('ol[aria-label="File selezionati"] > li')
  await expect(rows).toHaveText([/first\.pdf/, /second\.pdf/, /third\.pdf/])

  await page.getByRole('button', { name: 'Sposta third.pdf in alto' }).press('Enter')
  await expect(rows).toHaveText([/first\.pdf/, /third\.pdf/, /second\.pdf/])

  await page.getByRole('button', { name: 'Rimuovi first.pdf' }).click()
  await expect(rows).toHaveText([/third\.pdf/, /second\.pdf/])
  await expect(page.getByRole('button', { name: 'Unisci PDF' })).toBeEnabled()
})

test('accepts dropped PDFs and reports the new file count', async ({ page }) => {
  await openPdfTool(page)
  const files = [
    await createPdfFile('dropped-a.pdf', 100),
    await createPdfFile('dropped-b.pdf', 200),
  ]

  await page.getByText('Trascina qui i tuoi file PDF').evaluate((target, droppedFiles) => {
    const transfer = new DataTransfer()
    for (const file of droppedFiles) {
      const binary = atob(file.base64)
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
      transfer.items.add(new File([bytes], file.name, { type: file.mimeType }))
    }
    target.parentElement?.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }),
    )
  },
  files.map(({ name, mimeType, buffer }) => ({ name, mimeType, base64: buffer.toString('base64') })))

  await expect(page.locator('ol[aria-label="File selezionati"] > li')).toHaveCount(2)
  await expect(page.getByText('2 file', { exact: true })).toBeVisible()
})

test('merges in the selected order and downloads the requested filename', async ({ page }) => {
  await openPdfTool(page)
  await page.locator('input[type="file"]').setInputFiles([
    await createPdfFile('first.pdf', 100),
    await createPdfFile('second.pdf', 300),
  ])

  await page.getByRole('button', { name: 'Sposta second.pdf in alto' }).press('Enter')
  await page.getByLabel('Nome del PDF risultante').fill('combined-documents')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Unisci PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('combined-documents.pdf')
  await expect(page.getByRole('status')).toContainText('PDF unito e pronto per il download.')

  const path = await download.path()
  expect(path).not.toBeNull()
  const merged = await PDFDocument.load(await readFile(path!))
  expect(merged.getPageCount()).toBe(2)
  expect(merged.getPage(0).getWidth()).toBe(300)
  expect(merged.getPage(1).getWidth()).toBe(100)
})

test('shows a localized error for unreadable PDFs', async ({ page }) => {
  await openPdfTool(page)
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'corrupted.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') },
    await createPdfFile('valid.pdf', 200),
  ])

  await page.getByRole('button', { name: 'Unisci PDF' }).click()
  await expect(page.getByRole('alert')).toContainText('corrupted.pdf')
  await expect(page.getByRole('alert')).toContainText('danneggiato o protetto da password')
})

test('shows a localized error for non-PDF files', async ({ page }) => {
  await openPdfTool(page)
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a PDF') },
    await createPdfFile('valid.pdf', 200),
  ])

  await page.getByRole('button', { name: 'Unisci PDF' }).click()
  await expect(page.getByRole('alert')).toHaveText('Seleziona file PDF validi.')
})
