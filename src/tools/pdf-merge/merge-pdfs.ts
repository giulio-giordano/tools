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

export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) throw new PdfMergeError('minimum-files')

  const mergedDocument = await PDFDocument.create()

  for (const file of files) {
    const sourceDocument = await PDFDocument.load(await file.arrayBuffer())
    const pages = await mergedDocument.copyPages(sourceDocument, sourceDocument.getPageIndices())
    for (const page of pages) mergedDocument.addPage(page)
  }

  return mergedDocument.save()
}
