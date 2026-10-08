import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { convertDocxBatch, createPdfArchive, normalizePdfName } from '../convert-batch'
import type { DocxQueueItem, DocxItemStatus } from '../docx-files'

function makeItem(id: string, pdfName: string, content: string): DocxQueueItem {
  const bytes = new TextEncoder().encode(content)
  const file = {
    name: `${id}.docx`,
    arrayBuffer: async () => bytes.buffer,
  } as File
  return { id, file, pdfName, status: 'ready' }
}

describe('DOCX batch conversion', () => {
  it('sanitizes PDF names, rejects empty names, and keeps names within the limit', () => {
    expect(normalizePdfName('../report:final?.PDF')).toBe('_report_final_.pdf')
    expect(normalizePdfName('   ')).toBeNull()
    expect(normalizePdfName('...')).toBeNull()
    expect(normalizePdfName('CON')).toBe('_CON.pdf')
    expect(normalizePdfName('a'.repeat(200))?.length).toBe(120)
  })

  it('converts sequentially, continues after per-file failures, and disambiguates ZIP names', async () => {
    const items = [
      makeItem('first', 'Report.pdf', 'first'),
      makeItem('broken', 'REPORT.PDF', 'broken'),
      makeItem('last', 'report.PDF', 'last'),
      makeItem('unnamed', '   ', 'should-not-convert'),
    ]
    const calls: string[] = []
    const statusEvents: Array<[string, DocxItemStatus, string?]> = []

    const result = await convertDocxBatch(
      items,
      (id, status, error) => statusEvents.push([id, status, error]),
      async (bytes) => {
        const content = new TextDecoder().decode(bytes)
        calls.push(content)
        if (content === 'broken') throw new Error('corrupt DOCX')
        return new TextEncoder().encode(`%PDF-${content}`)
      },
    )

    expect(calls).toEqual(['first', 'broken', 'last'])
    expect(result.pdfs.map(({ fileName }) => fileName)).toEqual(['Report.pdf', 'report (2).pdf'])
    expect(result.failures).toEqual([
      { itemId: 'broken', fileName: 'broken.docx', code: 'conversion-failed' },
      { itemId: 'unnamed', fileName: 'unnamed.docx', code: 'invalid-name' },
    ])
    expect(statusEvents).toEqual([
      ['first', 'converting', undefined], ['first', 'converted', undefined],
      ['broken', 'converting', undefined], ['broken', 'failed', 'conversion-failed'],
      ['last', 'converting', undefined], ['last', 'converted', undefined],
      ['unnamed', 'failed', 'invalid-name'],
    ])

    const archive = unzipSync(createPdfArchive(result.pdfs))
    expect(Object.keys(archive).sort()).toEqual(['Report.pdf', 'report (2).pdf'].sort())
    expect(new TextDecoder().decode(archive['Report.pdf'])).toBe('%PDF-first')
    expect(new TextDecoder().decode(archive['report (2).pdf'])).toBe('%PDF-last')
  })
})
