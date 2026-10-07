import { PDFDocument } from 'pdf-lib'

export type PdfMergeErrorCode = 'minimum-files' | 'invalid-pdf' | 'unreadable-pdf'

export class PdfMergeError extends Error {
  constructor(
    readonly code: PdfMergeErrorCode,
    readonly fileName?: string,
  ) {
    super(code)
    this.name = 'PdfMergeError'
  }
}

function isPdfFile(file: File): boolean {
  return file.type.toLowerCase() === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) throw new PdfMergeError('minimum-files')
  if (files.some((file) => !isPdfFile(file))) throw new PdfMergeError('invalid-pdf')

  const mergedDocument = await PDFDocument.create()

  for (const file of files) {
    try {
      const sourceDocument = await PDFDocument.load(await file.arrayBuffer())
      const pages = await mergedDocument.copyPages(sourceDocument, sourceDocument.getPageIndices())
      for (const page of pages) mergedDocument.addPage(page)
    } catch {
      throw new PdfMergeError('unreadable-pdf', file.name)
    }
  }

  return mergedDocument.save()
}
