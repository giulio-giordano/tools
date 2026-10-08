export type PdfToDocxItemStatus = 'ready' | 'converting' | 'converted' | 'failed'
export type PdfToDocxItemError = 'invalid-name' | 'password-protected' | 'conversion-failed'

export interface PdfToDocxQueueItem {
  id: string
  file: File
  docxName: string
  status: PdfToDocxItemStatus
  error?: PdfToDocxItemError
  lossCount?: number
  lossDetails?: string[]
}

export interface PdfFileSelection {
  accepted: File[]
  rejected: File[]
}

let nextFileId = 0

export function isPdfFile(file: File): boolean {
  return file.type.toLowerCase() === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function partitionPdfFiles(files: FileList | readonly File[]): PdfFileSelection {
  const accepted: File[] = []
  const rejected: File[] = []

  for (const file of Array.from(files)) {
    if (isPdfFile(file)) accepted.push(file)
    else rejected.push(file)
  }

  return { accepted, rejected }
}

export function createPdfToDocxQueueItems(files: readonly File[]): PdfToDocxQueueItem[] {
  return files.map((file) => ({
    id: `pdf-to-docx-${nextFileId++}`,
    file,
    docxName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
    status: 'ready',
  }))
}
