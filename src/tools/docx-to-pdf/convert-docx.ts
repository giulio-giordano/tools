import type { ConvertResult, ReamConvertOptions } from 'reamkit'
import { loadBundledFonts } from './local-fonts'

const denyRemoteFontFetch: NonNullable<ReamConvertOptions['fontFetch']> = async () => {
  throw new Error('Remote font requests are disabled.')
}

export async function convertDocxBytesToPdf(docxBytes: Uint8Array): Promise<ConvertResult> {
  const { Ream } = await import('reamkit')
  const document = Ream.parse(docxBytes)
  if (document.format !== 'docx') {
    throw new Error('The selected file is not a DOCX document.')
  }

  return document.convertWithReport('pdf', {
    fonts: await loadBundledFonts(),
    fontFetch: denyRemoteFontFetch,
  })
}
