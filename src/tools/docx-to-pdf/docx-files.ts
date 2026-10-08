export type DocxItemStatus = 'ready' | 'converting' | 'converted' | 'failed'
export type DocxItemError = 'invalid-name' | 'conversion-failed'

export interface DocxQueueItem {
  id: string
  file: File
  pdfName: string
  status: DocxItemStatus
  error?: DocxItemError
}

export interface DocxFileSelection {
  accepted: File[]
  rejected: File[]
}

let nextFileId = 0

export function isDocxFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.docx')
}

export function partitionDocxFiles(files: FileList | readonly File[]): DocxFileSelection {
  const accepted: File[] = []
  const rejected: File[] = []

  for (const file of Array.from(files)) {
    if (isDocxFile(file)) accepted.push(file)
    else rejected.push(file)
  }

  return { accepted, rejected }
}

export function createDocxQueueItems(files: readonly File[]): DocxQueueItem[] {
  return files.map((file) => ({
    id: `docx-${nextFileId++}`,
    file,
    pdfName: `${file.name.replace(/\.docx$/i, '')}.pdf`,
    status: 'ready',
  }))
}
