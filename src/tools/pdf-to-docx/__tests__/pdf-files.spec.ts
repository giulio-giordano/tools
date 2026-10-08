import { describe, expect, it } from 'vitest'
import { createPdfToDocxQueueItems, isPdfFile, partitionPdfFiles } from '../pdf-files'

function makeFile(name: string, type = ''): File {
  return { name, type } as File
}

describe('PDF to DOCX file selection', () => {
  it('accepts PDFs by extension or MIME type and rejects other files', () => {
    const pdfByName = makeFile('report.PDF')
    const pdfByMime = makeFile('extensionless', 'application/pdf')
    const text = makeFile('notes.txt', 'text/plain')

    expect(isPdfFile(pdfByName)).toBe(true)
    expect(isPdfFile(pdfByMime)).toBe(true)
    expect(partitionPdfFiles([pdfByName, pdfByMime, text])).toEqual({
      accepted: [pdfByName, pdfByMime],
      rejected: [text],
    })
  })

  it('creates editable DOCX output names for selected PDFs', () => {
    const items = createPdfToDocxQueueItems([makeFile('annual-report.pdf'), makeFile('SCAN.PDF')])

    expect(items.map(({ docxName, status }) => [docxName, status])).toEqual([
      ['annual-report.docx', 'ready'],
      ['SCAN.docx', 'ready'],
    ])
    expect(new Set(items.map(({ id }) => id)).size).toBe(items.length)
  })
})
