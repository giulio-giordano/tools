import { describe, expect, it } from 'vitest'
import { createDocxQueueItems, isDocxFile, partitionDocxFiles } from '../docx-files'

describe('DOCX selection', () => {
  it('accepts the .docx extension case-insensitively and rejects other formats', () => {
    expect(isDocxFile(new File([], 'report.docx'))).toBe(true)
    expect(isDocxFile(new File([], 'REPORT.DOCX'))).toBe(true)
    expect(isDocxFile(new File([], 'report.doc'))).toBe(false)
    expect(isDocxFile(new File([], 'report.docx.pdf'))).toBe(false)

    const selection = partitionDocxFiles([
      new File([], 'one.docx'),
      new File([], 'two.DOCX'),
      new File([], 'legacy.doc'),
      new File([], 'notes.txt'),
    ])
    expect(selection.accepted.map((file) => file.name)).toEqual(['one.docx', 'two.DOCX'])
    expect(selection.rejected.map((file) => file.name)).toEqual(['legacy.doc', 'notes.txt'])
  })

  it('initializes editable PDF names from each source basename', () => {
    const items = createDocxQueueItems([
      new File([], 'my-report.docx'),
      new File([], 'ANNUAL.DOCX'),
    ])

    expect(items.map((item) => item.pdfName)).toEqual(['my-report.pdf', 'ANNUAL.pdf'])
    expect(items.map((item) => item.status)).toEqual(['ready', 'ready'])
    expect(items.map((item) => item.file.name)).toEqual(['my-report.docx', 'ANNUAL.DOCX'])
  })
})
