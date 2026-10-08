import { Ream } from 'reamkit'

export interface PdfConversionLoss {
  severity: string
  detail: string
}

export interface PdfToDocxConversion {
  bytes: Uint8Array
  losses: readonly PdfConversionLoss[]
}

export type PdfConversionErrorCode = 'password-protected' | 'conversion-failed'

export class PdfConversionError extends Error {
  constructor(readonly code: PdfConversionErrorCode) {
    super(code)
    this.name = 'PdfConversionError'
  }
}

function isPasswordProtectionLoss(loss: PdfConversionLoss): boolean {
  return loss.detail.startsWith('encrypted PDF')
}

export async function convertPdfBytesToDocx(bytes: Uint8Array): Promise<PdfToDocxConversion> {
  try {
    const ream = Ream.parse(bytes)
    const result = await ream.convertWithReport('docx')

    if (result.losses.some(isPasswordProtectionLoss)) {
      throw new PdfConversionError('password-protected')
    }

    return { bytes: result.bytes, losses: result.losses }
  } catch (error) {
    if (error instanceof PdfConversionError) throw error
    throw new PdfConversionError('conversion-failed')
  }
}
