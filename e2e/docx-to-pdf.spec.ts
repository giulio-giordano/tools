import { readFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { unzipSync } from 'fflate'
import { expect, test } from '@playwright/test'
import { makeDocxUpload } from './docx-fixture.js'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

test('converts multiple DOCX files locally and downloads only successful PDFs in one ZIP', async ({ page }) => {
  const requests: Array<{ url: string; method: string; postData: string | null }> = []
  page.on('request', (request) => requests.push({
    url: request.url(),
    method: request.method(),
    postData: request.postData(),
  }))

  await page.goto('/')
  await page.getByRole('link', { name: 'Converti DOCX in PDF' }).first().click()
  await expect(page.getByRole('heading', { name: 'Converti DOCX in PDF' })).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles([
    makeDocxUpload('first.docx', 'Text document with an image and a table'),
    makeDocxUpload('second.docx', 'Second valid document'),
    { name: 'broken.docx', mimeType: DOCX_MIME, buffer: Buffer.from('not a DOCX archive') },
    { name: 'legacy.doc', mimeType: 'application/msword', buffer: Buffer.from('legacy document') },
  ])

  const rows = page.locator('ol[aria-label="File selezionati"] > li')
  await expect(rows).toHaveCount(3)
  await expect(page.getByRole('alert')).toContainText('legacy.doc')
  await expect(page.getByLabel('Nome del PDF per first.docx')).toHaveValue('first.pdf')
  await page.getByLabel('Nome del PDF per first.docx').fill('custom-output')

  await page.getByRole('button', { name: 'Converti file DOCX' }).click()
  await expect(page.getByRole('status')).toContainText('Conversione completata: 2 PDF')
  await expect(page.getByRole('link', { name: 'Scarica archivio ZIP' })).toBeVisible()
  await expect(rows.nth(0)).toContainText('Convertito')
  await expect(rows.nth(1)).toContainText('Convertito')
  await expect(rows.nth(2)).toContainText('Non convertito')
  await expect(rows.nth(2)).toContainText('Verifica che sia un DOCX valido')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Scarica archivio ZIP' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('docx-pdf-convertiti.zip')

  const downloadPath = await download.path()
  expect(downloadPath).not.toBeNull()
  const archive = unzipSync(new Uint8Array(await readFile(downloadPath!)))
  expect(Object.keys(archive).sort()).toEqual(['custom-output.pdf', 'second.pdf'])
  for (const pdfBytes of Object.values(archive)) {
    expect(new TextDecoder().decode(pdfBytes.subarray(0, 5))).toBe('%PDF-')
    const pdf = await PDFDocument.load(pdfBytes)
    expect(pdf.getPageCount()).toBeGreaterThan(0)
  }

  const appOrigin = new URL(page.url()).origin
  expect(requests.filter((request) => new URL(request.url).origin !== appOrigin)).toEqual([])
  expect(requests.filter((request) => !['GET', 'HEAD'].includes(request.method))).toEqual([])
  expect(requests.filter((request) => request.postData !== null)).toEqual([])
})
