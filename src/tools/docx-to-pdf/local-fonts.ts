import type { FontBytesByVariant } from 'reamkit'
import boldItalicUrl from './fonts/Carlito-BoldItalic.ttf?url'
import boldUrl from './fonts/Carlito-Bold.ttf?url'
import italicUrl from './fonts/Carlito-Italic.ttf?url'
import regularUrl from './fonts/Carlito-Regular.ttf?url'

let bundledFonts: Promise<FontBytesByVariant> | undefined

async function loadFont(url: string): Promise<Uint8Array> {
  const assetUrl = new URL(url, window.location.href)
  if (assetUrl.origin !== window.location.origin) {
    throw new Error('Font assets must be served from this application.')
  }

  const response = await fetch(assetUrl)
  if (!response.ok) {
    throw new Error(`Could not load a bundled font (${response.status}).`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

export function loadBundledFonts(): Promise<FontBytesByVariant> {
  bundledFonts ??= Promise.all([
    loadFont(regularUrl),
    loadFont(boldUrl),
    loadFont(italicUrl),
    loadFont(boldItalicUrl),
  ]).then(([regular, bold, italic, boldItalic]) => ({ regular, bold, italic, boldItalic }))

  return bundledFonts
}
