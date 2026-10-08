import { readFile } from 'node:fs/promises'
import { PDFDocument, rgb } from 'pdf-lib'
import { unzipSync } from 'fflate'
import { expect, test } from '@playwright/test'

const SCAN_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pV8AAAAASUVORK5CYII=',
  'base64',
)

async function createPdfFile(
  name: string,
  options: { text?: string; scannedImage?: boolean } = {},
) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792])
  if (options.scannedImage) {
    const image = await pdf.embedPng(SCAN_PIXEL)
    page.drawImage(image, { x: 36, y: 36, width: 540, height: 720 })
  }
  if (options.text) page.drawText(options.text, { x: 72, y: 700, size: 18, color: rgb(0, 0, 0) })
  return { name, mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) }
}

test('converts text, scanned, and mixed PDFs locally and downloads successful DOCX files in one ZIP', async ({
  page,
}) => {
  const requests: Array<{ url: string; method: string; postData: string | null }> = []
  page.on('request', (request) =>
    requests.push({
      url: request.url(),
      method: request.method(),
      postData: request.postData(),
    }),
  )

  await page.goto('/')
  await page.getByRole('link', { name: 'Converti PDF in DOCX' }).first().click()
  await expect(page.getByRole('heading', { name: 'Converti PDF in DOCX' })).toBeVisible()
  await expect(
    page.getByText(
      'I PDF restano sul tuo dispositivo: la conversione avviene interamente nel browser e i file non vengono inviati all’esterno.',
    ),
  ).toBeVisible()

  await page
    .locator('input[type="file"]')
    .setInputFiles([
      await createPdfFile('text.pdf', { text: 'Selectable PDF text' }),
      await createPdfFile('scan.pdf', { scannedImage: true }),
      await createPdfFile('mixed.pdf', { text: 'Selectable mixed text', scannedImage: true }),
      { name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') },
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('ignored text file') },
    ])

  const rows = page.locator('ol[aria-label="File selezionati"] > li')
  await expect(rows).toHaveCount(4)
  await expect(page.getByRole('alert')).toContainText('notes.txt')
  await page.getByLabel('Nome del DOCX per text.pdf').fill('custom-report')

  await page.getByRole('button', { name: 'Converti file PDF' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Conversione completata: 3 DOCX nell’archivio ZIP; file non convertiti: 1.',
  )
  await expect(rows.nth(0)).toContainText('Convertito')
  await expect(rows.nth(0)).toContainText('Il report segnala')
  await expect(rows.nth(1)).toContainText('Convertito')
  await expect(rows.nth(2)).toContainText('Convertito')
  await expect(rows.nth(3)).toContainText('Non convertito')
  await expect(rows.nth(3)).toContainText('broken.pdf')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Scarica archivio ZIP' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('pdf-to-docx-convertiti.zip')
  const downloadPath = await download.path()
  expect(downloadPath).not.toBeNull()
  const archive = unzipSync(new Uint8Array(await readFile(downloadPath!)))
  expect(Object.keys(archive).sort()).toEqual(
    ['custom-report.docx', 'mixed.docx', 'scan.docx'].sort(),
  )

  const textXml = new TextDecoder().decode(
    unzipSync(archive['custom-report.docx']!)['word/document.xml'],
  )
  const scanEntries = unzipSync(archive['scan.docx']!)
  const scanXml = new TextDecoder().decode(scanEntries['word/document.xml'])
  const mixedEntries = unzipSync(archive['mixed.docx']!)
  const mixedXml = new TextDecoder().decode(mixedEntries['word/document.xml'])
  expect(textXml).toContain('Selectable PDF text')
  expect(scanXml).toContain('<w:drawing>')
  expect(scanXml).not.toContain('Selectable PDF text')
  expect(Object.keys(scanEntries).some((path) => path.startsWith('word/media/'))).toBe(true)
  expect(mixedXml).toContain('Selectable mixed text')
  expect(mixedXml).toContain('<w:drawing>')
  expect(Object.keys(mixedEntries).some((path) => path.startsWith('word/media/'))).toBe(true)

  const appOrigin = new URL(page.url()).origin
  expect(requests.filter((request) => new URL(request.url).origin !== appOrigin)).toEqual([])
  expect(requests.filter((request) => !['GET', 'HEAD'].includes(request.method))).toEqual([])
  expect(requests.filter((request) => request.postData !== null)).toEqual([])
})
