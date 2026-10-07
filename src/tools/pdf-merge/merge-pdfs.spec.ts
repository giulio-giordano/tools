import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { mergePdfFiles } from './merge-pdfs'

async function createPdf(width: number): Promise<File> {
  const document = await PDFDocument.create()
  document.addPage([width, width + 100])
  const bytes = await document.save()

  return new File([bytes.slice().buffer as ArrayBuffer], `document-${width}.pdf`, {
    type: 'application/pdf',
  })
}

describe('mergePdfFiles', () => {
  it('merges PDFs in the order they are provided', async () => {
    const first = await createPdf(100)
    const second = await createPdf(300)
    const mergedBytes = await mergePdfFiles([first, second])
    const mergedDocument = await PDFDocument.load(mergedBytes)

    expect(mergedDocument.getPageCount()).toBe(2)
    expect(mergedDocument.getPage(0).getWidth()).toBe(100)
    expect(mergedDocument.getPage(1).getWidth()).toBe(300)
  })

  it('requires at least two PDF files', async () => {
    await expect(mergePdfFiles([])).rejects.toMatchObject({ code: 'minimum-files' })
    await expect(mergePdfFiles([await createPdf(100)])).rejects.toMatchObject({
      code: 'minimum-files',
    })
  })
})
