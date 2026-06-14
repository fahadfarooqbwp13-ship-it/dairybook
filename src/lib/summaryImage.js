// Generic branded summary image (canvas → PNG) used for every non-bill share —
// reports, per-animal milk, expenses, etc. Same look as the bill: green header,
// white rows, light-green highlight, green footer. No libraries, works offline.
import { shareImage } from './share.js'

const FONT_UR = '"Noto Nastaliq Urdu"'
const FONT_MONO = '"Roboto Mono"'
const C = { green: '#1B5E20', cream: '#FFF8F0', ink: '#1A1A1A', muted: '#5D4037', lightGreen: '#E8F5E9', zebra: '#F5F5F5', ok: '#2E7D32', danger: '#B71C1C' }

async function ensureFonts() {
  if (!document.fonts) return
  try {
    await Promise.all([
      document.fonts.load(`700 40px ${FONT_UR}`),
      document.fonts.load(`600 26px ${FONT_UR}`),
      document.fonts.load(`700 30px ${FONT_MONO}`),
      document.fonts.load(`600 24px ${FONT_MONO}`),
    ])
    await document.fonts.ready
  } catch {
    /* fall back to system shaping */
  }
}

// data: { brand, title, subtitle, rows:[{label,value,color?}], highlight:{label,value,color}, footer }
export async function renderSummary(data) {
  await ensureFonts()
  const W = 800
  const padX = 44
  const headerH = 132
  const rowH = 56
  const rows = data.rows || []
  const bodyH = rows.length * rowH + 24
  const highH = data.highlight ? 96 : 0
  const footerH = 80
  const H = headerH + bodyH + highH + footerH

  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'middle'
  const ur = (size, w = 600) => { ctx.font = `${w} ${size}px ${FONT_UR}`; ctx.direction = 'rtl' }
  const num = (size, w = 600) => { ctx.font = `${w} ${size}px ${FONT_MONO}`; ctx.direction = 'ltr' }

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)

  // header
  ctx.fillStyle = C.green
  ctx.fillRect(0, 0, W, headerH)
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ur(22, 500)
  ctx.fillText(data.brand || 'ڈیری بک', W / 2, 32)
  ur(38, 700)
  ctx.fillText(data.title || '', W / 2, 74)
  if (data.subtitle) {
    ur(24, 500)
    ctx.fillText(data.subtitle, W / 2, 110)
  }

  // rows
  let y = headerH + 12
  rows.forEach((r, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : C.zebra
    ctx.fillRect(0, y, W, rowH)
    const cy = y + rowH / 2
    ctx.fillStyle = C.ink
    ur(26, 600)
    ctx.textAlign = 'right'
    ctx.fillText(r.label, W - padX, cy)
    ctx.fillStyle = r.color || C.ink
    num(26, 700)
    ctx.textAlign = 'left'
    ctx.fillText(String(r.value), padX, cy)
    y += rowH
  })

  // highlight
  if (data.highlight) {
    y += 12
    ctx.fillStyle = C.lightGreen
    ctx.fillRect(0, y, W, highH - 12)
    const cy = y + (highH - 12) / 2
    ctx.fillStyle = C.ink
    ur(30, 700)
    ctx.textAlign = 'right'
    ctx.fillText(data.highlight.label, W - padX, cy)
    ctx.fillStyle = data.highlight.color || C.ok
    num(34, 700)
    ctx.textAlign = 'left'
    ctx.fillText(String(data.highlight.value), padX, cy)
    y += highH - 12
  }

  // footer
  const fy = H - footerH
  ctx.fillStyle = C.green
  ctx.fillRect(0, fy, W, footerH)
  ctx.fillStyle = '#FFFFFF'
  ur(22, 600)
  ctx.textAlign = 'center'
  ctx.fillText(data.footer || 'ڈیری بک — آپ کا ڈیجیٹل فارم مددگار', W / 2, fy + 30)
  const now = new Date()
  num(16, 500)
  ctx.fillText(`${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, W / 2, fy + 58)

  const dataUrl = canvas.toDataURL('image/png')
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return { blob, dataUrl }
}

// Convenience: render + share as an image. Returns 'shared' | 'cancelled' | 'downloaded'.
export async function shareSummary(data, filename) {
  const { blob } = await renderSummary(data)
  return shareImage(blob, filename || 'dairybook.png')
}
