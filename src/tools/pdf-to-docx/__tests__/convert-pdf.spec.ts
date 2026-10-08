import { inflateSync } from 'node:zlib'
import { PDFDocument, rgb } from 'pdf-lib'
import { Ream } from 'reamkit'
import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { convertPdfBytesToDocx } from '../convert-pdf'

const scannedPageImage = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pV8AAAAASUVORK5CYII=',
  ),
  (character) => character.charCodeAt(0),
)

function decodeSinglePngPixel(png: Uint8Array): number[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  let bitDepth = 0
  let colorType = 0
  const imageData: Uint8Array[] = []

  for (let offset = 8; offset < png.length;) {
    const length = view.getUint32(offset)
    const type = new TextDecoder().decode(png.subarray(offset + 4, offset + 8))
    const data = png.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      bitDepth = data[8]!
      colorType = data[9]!
    } else if (type === 'IDAT') {
      imageData.push(data)
    } else if (type === 'IEND') {
      break
    }
    offset += length + 12
  }

  if (bitDepth !== 8) throw new Error(`Unsupported PNG bit depth: ${bitDepth}`)
  const compressed = new Uint8Array(imageData.reduce((size, part) => size + part.length, 0))
  let offset = 0
  for (const part of imageData) {
    compressed.set(part, offset)
    offset += part.length
  }
  const channels =
    colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 6 ? 4 : 0
  if (!channels) throw new Error(`Unsupported PNG color type: ${colorType}`)
  const pixel = inflateSync(compressed).subarray(1, channels + 1)
  if (colorType === 0) return [pixel[0]!, pixel[0]!, pixel[0]!, 255]
  if (colorType === 2) return [pixel[0]!, pixel[1]!, pixel[2]!, 255]
  if (colorType === 4) return [pixel[0]!, pixel[0]!, pixel[0]!, pixel[1]!]
  return [pixel[0]!, pixel[1]!, pixel[2]!, pixel[3]!]
}

async function createImagePdf(includeSelectableText: boolean): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792])
  const image = await pdf.embedPng(scannedPageImage)
  page.drawImage(image, { x: 36, y: 36, width: 540, height: 720 })
  if (includeSelectableText) {
    page.drawText('Selectable source text', { x: 72, y: 700, size: 18, color: rgb(0, 0, 0) })
  }
  return pdf.save()
}

describe('PDF to DOCX conversion', () => {
  it('keeps selectable PDF text and embedded scan artwork in the DOCX without OCR', async () => {
    const result = await convertPdfBytesToDocx(await createImagePdf(true))
    const entries = unzipSync(result.bytes)
    const documentXml = new TextDecoder().decode(entries['word/document.xml'])
    const media = Object.keys(entries).filter((path) => path.startsWith('word/media/'))

    expect(documentXml).toContain('Selectable source text')
    expect(documentXml).toContain('<w:drawing>')
    expect(media).toHaveLength(1)
    expect(decodeSinglePngPixel(entries[media[0]!]!)).toEqual(
      decodeSinglePngPixel(scannedPageImage),
    )
    expect(result.losses.length).toBeGreaterThan(0)
  })

  it('preserves an image-only scanned page as artwork and does not invent text', async () => {
    const result = await convertPdfBytesToDocx(await createImagePdf(false))
    const entries = unzipSync(result.bytes)
    const documentXml = new TextDecoder().decode(entries['word/document.xml'])
    const media = Object.keys(entries).filter((path) => path.startsWith('word/media/'))

    expect(documentXml).toContain('<w:drawing>')
    expect(documentXml).not.toContain('Selectable source text')
    expect(media).toHaveLength(1)
    expect(decodeSinglePngPixel(entries[media[0]!]!)).toEqual(
      decodeSinglePngPixel(scannedPageImage),
    )
  })

  it('identifies password-protected PDFs instead of exporting incomplete content', async () => {
    const source = await PDFDocument.create()
    source.addPage().drawText('Protected source')
    const protectedPdf = await Ream.parse(await source.save()).convert('pdf', {
      encrypt: { userPassword: 'local-test-password' },
    })

    await expect(convertPdfBytesToDocx(protectedPdf)).rejects.toMatchObject({
      code: 'password-protected',
    })
  })

  it('identifies invalid or corrupt input as a conversion failure', async () => {
    await expect(
      convertPdfBytesToDocx(new TextEncoder().encode('not a PDF')),
    ).rejects.toMatchObject({
      code: 'conversion-failed',
    })
  })
})
