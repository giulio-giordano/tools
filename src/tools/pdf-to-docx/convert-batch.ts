import { zipSync } from 'fflate'
import { convertPdfBytesToDocx, PdfConversionError, type PdfToDocxConversion } from './convert-pdf'
import type { PdfToDocxItemError, PdfToDocxItemStatus, PdfToDocxQueueItem } from './pdf-files'

export interface ConvertedDocx {
  itemId: string
  fileName: string
  bytes: Uint8Array
  lossCount: number
}

export interface PdfConversionFailure {
  itemId: string
  fileName: string
  code: PdfToDocxItemError
}

export interface PdfBatchResult {
  docxFiles: ConvertedDocx[]
  failures: PdfConversionFailure[]
}

export type ConvertPdf = (bytes: Uint8Array) => Promise<PdfToDocxConversion>
export type UpdatePdfStatus = (
  itemId: string,
  status: PdfToDocxItemStatus,
  error?: PdfToDocxItemError,
  lossCount?: number,
  lossDetails?: string[],
) => void

const MAX_OUTPUT_NAME_LENGTH = 120

export function normalizeDocxName(input: string): string | null {
  const stem = input
    .trim()
    .replace(/\.docx$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_')
    .replace(/[. ]+$/g, '')
    .replace(/^\.+/g, '')
    .trim()

  if (!stem) return null
  const safeStem = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(stem) ? `_${stem}` : stem
  return `${safeStem.slice(0, MAX_OUTPUT_NAME_LENGTH - 5)}.docx`
}

function claimUniqueName(fileName: string, usedNames: Set<string>): string {
  const stem = fileName.slice(0, -5)
  let index = 1
  let candidate = fileName

  while (usedNames.has(candidate.toLowerCase())) {
    index += 1
    const suffix = ` (${index})`
    const truncatedStem = stem.slice(0, MAX_OUTPUT_NAME_LENGTH - suffix.length - 5).trimEnd()
    candidate = `${truncatedStem}${suffix}.docx`
  }

  usedNames.add(candidate.toLowerCase())
  return candidate
}

export async function convertPdfBatch(
  items: readonly PdfToDocxQueueItem[],
  onStatus: UpdatePdfStatus,
  convert: ConvertPdf = convertPdfBytesToDocx,
): Promise<PdfBatchResult> {
  const docxFiles: ConvertedDocx[] = []
  const failures: PdfConversionFailure[] = []
  const usedNames = new Set<string>()

  for (const item of items) {
    const fileName = normalizeDocxName(item.docxName)
    if (!fileName) {
      const failure: PdfConversionFailure = {
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
      const result = await convert(inputBytes)
      docxFiles.push({
        itemId: item.id,
        fileName: claimUniqueName(fileName, usedNames),
        bytes: result.bytes,
        lossCount: result.losses.length,
      })
      onStatus(
        item.id,
        'converted',
        undefined,
        result.losses.length,
        result.losses.map((loss) => loss.detail),
      )
    } catch (error) {
      const code = error instanceof PdfConversionError ? error.code : 'conversion-failed'
      const failure: PdfConversionFailure = {
        itemId: item.id,
        fileName: item.file.name,
        code,
      }
      failures.push(failure)
      onStatus(item.id, 'failed', failure.code)
    }
  }

  return { docxFiles, failures }
}

export function createDocxArchive(docxFiles: readonly ConvertedDocx[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const docx of docxFiles) entries[docx.fileName] = docx.bytes
  return zipSync(entries, { level: 1 })
}
