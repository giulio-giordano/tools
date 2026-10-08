import { zipSync } from 'fflate'
import { convertDocxBytesToPdf } from './convert-docx'
import type { DocxItemError, DocxItemStatus, DocxQueueItem } from './docx-files'

export interface ConvertedPdf {
  itemId: string
  fileName: string
  bytes: Uint8Array
}

export interface DocxConversionFailure {
  itemId: string
  fileName: string
  code: DocxItemError
}

export interface DocxBatchResult {
  pdfs: ConvertedPdf[]
  failures: DocxConversionFailure[]
}

export type ConvertDocx = (bytes: Uint8Array) => Promise<Uint8Array>
export type UpdateDocxStatus = (itemId: string, status: DocxItemStatus, error?: DocxItemError) => void

const MAX_OUTPUT_NAME_LENGTH = 120

export function normalizePdfName(input: string): string | null {
  const stem = input.trim()
    .replace(/\.pdf$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_')
    .replace(/[. ]+$/g, '')
    .replace(/^\.+/g, '')
    .trim()

  if (!stem) return null
  const safeStem = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(stem) ? `_${stem}` : stem
  return `${safeStem.slice(0, MAX_OUTPUT_NAME_LENGTH - 4)}.pdf`
}

function claimUniqueName(fileName: string, usedNames: Set<string>): string {
  const stem = fileName.slice(0, -4)
  let index = 1
  let candidate = fileName

  while (usedNames.has(candidate.toLowerCase())) {
    index += 1
    const suffix = ` (${index})`
    const truncatedStem = stem.slice(0, MAX_OUTPUT_NAME_LENGTH - suffix.length - 4).trimEnd()
    candidate = `${truncatedStem}${suffix}.pdf`
  }

  usedNames.add(candidate.toLowerCase())
  return candidate
}

export async function convertDocxBatch(
  items: readonly DocxQueueItem[],
  onStatus: UpdateDocxStatus,
  convert: ConvertDocx = async (bytes) => (await convertDocxBytesToPdf(bytes)).bytes,
): Promise<DocxBatchResult> {
  const pdfs: ConvertedPdf[] = []
  const failures: DocxConversionFailure[] = []
  const usedNames = new Set<string>()

  for (const item of items) {
    const fileName = normalizePdfName(item.pdfName)
    if (!fileName) {
      const failure: DocxConversionFailure = {
        itemId: item.id,
        fileName: item.file.name,
        code: 'invalid-name',
      }
      failures.push(failure)
      onStatus(item.id, 'failed', failure.code)
      continue
    }

    onStatus(item.id, 'converting')
    try {
      const inputBytes = new Uint8Array(await item.file.arrayBuffer())
      const bytes = await convert(inputBytes)
      pdfs.push({
        itemId: item.id,
        fileName: claimUniqueName(fileName, usedNames),
        bytes,
      })
      onStatus(item.id, 'converted')
    } catch {
      const failure: DocxConversionFailure = {
        itemId: item.id,
        fileName: item.file.name,
        code: 'conversion-failed',
      }
      failures.push(failure)
      onStatus(item.id, 'failed', failure.code)
    }
  }

  return { pdfs, failures }
}

export function createPdfArchive(pdfs: readonly ConvertedPdf[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const pdf of pdfs) entries[pdf.fileName] = pdf.bytes
  return zipSync(entries, { level: 1 })
}
