import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { convertPdfBatch, createDocxArchive, normalizeDocxName } from '../convert-batch'
import { PdfConversionError } from '../convert-pdf'
import type { PdfToDocxQueueItem, PdfToDocxItemStatus } from '../pdf-files'

function makeItem(id: string, docxName: string, content: string): PdfToDocxQueueItem {
  const bytes = new TextEncoder().encode(content)
  const file = {
    name: `${id}.pdf`,
    arrayBuffer: async () => bytes.buffer,
  } as File
  return { id, file, docxName, status: 'ready' }
}

describe('PDF to DOCX batch conversion', () => {
  it('sanitizes DOCX names, rejects empty names, and keeps names within the limit', () => {
    expect(normalizeDocxName('../report:final?.DOCX')).toBe('_report_final_.docx')
    expect(normalizeDocxName('   ')).toBeNull()
    expect(normalizeDocxName('...')).toBeNull()
    expect(normalizeDocxName('CON')).toBe('_CON.docx')
    expect(normalizeDocxName('a'.repeat(200))?.length).toBe(120)
  })

  it('converts sequentially, keeps partial successes, identifies protected PDFs, and disambiguates ZIP names', async () => {
    const items = [
      makeItem('first', 'Report.docx', 'first'),
      makeItem('protected', 'REPORT.DOCX', 'protected'),
      makeItem('last', 'report.DOCX', 'last'),
      makeItem('unnamed', '   ', 'should-not-convert'),
    ]
    const calls: string[] = []
    const statusEvents: Array<[string, PdfToDocxItemStatus, string?, number?, string[]?]> = []

    const result = await convertPdfBatch(
      items,
      (id, status, error, lossCount, lossDetails) =>
        statusEvents.push([id, status, error, lossCount, lossDetails]),
      async (bytes) => {
        const content = new TextDecoder().decode(bytes)
        calls.push(content)
        if (content === 'protected') throw new PdfConversionError('password-protected')
        return {
          bytes: new TextEncoder().encode(`DOCX-${content}`),
          losses: [{ severity: 'degraded', detail: 'test loss' }],
        }
      },
    )

    expect(calls).toEqual(['first', 'protected', 'last'])
    expect(result.docxFiles.map(({ fileName }) => fileName)).toEqual([
      'Report.docx',
      'report (2).docx',
    ])
    expect(result.docxFiles.map(({ lossCount }) => lossCount)).toEqual([1, 1])
    expect(result.failures).toEqual([
      { itemId: 'protected', fileName: 'protected.pdf', code: 'password-protected' },
      { itemId: 'unnamed', fileName: 'unnamed.pdf', code: 'invalid-name' },
    ])
    expect(statusEvents).toEqual([
      ['first', 'converting', undefined, undefined, undefined],
      ['first', 'converted', undefined, 1, ['test loss']],
      ['protected', 'converting', undefined, undefined, undefined],
      ['protected', 'failed', 'password-protected', undefined, undefined],
      ['last', 'converting', undefined, undefined, undefined],
      ['last', 'converted', undefined, 1, ['test loss']],
      ['unnamed', 'failed', 'invalid-name', undefined, undefined],
    ])

    const archive = unzipSync(createDocxArchive(result.docxFiles))
    expect(Object.keys(archive).sort()).toEqual(['Report.docx', 'report (2).docx'].sort())
    expect(new TextDecoder().decode(archive['Report.docx'])).toBe('DOCX-first')
    expect(new TextDecoder().decode(archive['report (2).docx'])).toBe('DOCX-last')
  })

  it('reports unreadable input as a per-file failure and continues the batch', async () => {
    const result = await convertPdfBatch(
      [makeItem('broken', 'broken.docx', 'broken'), makeItem('valid', 'valid.docx', 'valid')],
      () => undefined,
      async (bytes) => {
        const content = new TextDecoder().decode(bytes)
        if (content === 'broken') throw new Error('invalid PDF')
        return { bytes: new TextEncoder().encode('valid DOCX'), losses: [] }
      },
    )

    expect(result.docxFiles.map(({ fileName }) => fileName)).toEqual(['valid.docx'])
    expect(result.failures).toEqual([
      { itemId: 'broken', fileName: 'broken.pdf', code: 'conversion-failed' },
    ])
  })
})
