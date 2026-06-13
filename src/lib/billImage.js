// Draws a printed-receipt-style monthly bill onto a canvas and returns a PNG.
// No external libraries — pure Canvas API, works offline. Urdu Nastaliq is the
// font already linked in index.html (and SW-cached), so document.fonts.load()
// resolves offline after first run.
const FONT_UR = '"Noto Nastaliq Urdu"'
const FONT_MONO = '"Roboto Mono"'

async function ensureFonts() {
  if (!document.fonts) return
  const wanted = [
    `700 44px ${FONT_UR}`, `700 34px ${FONT_UR}`, `600 26px ${FONT_UR}`,
    `500 24px ${FONT_UR}`, `700 30px ${FONT_MONO}`, `600 24px ${FONT_MONO}`,
  ]
  try {
    await Promise.all(wanted.map((f) => document.fonts.load(f)))
    await document.fonts.ready
  } catch {
    /* fall back to system shaping */
  }
}

const C = {
  green: '#1B5E20', amber: '#E65100', cream: '#FFF8F0', ink: '#1A1A1A',
  muted: '#5D4037', lightGreen: '#E8F5E9', zebra: '#F5F5F5', danger: '#B71C1C', ok: '#2E7D32',
}

// bill: { farmName, buyerName, monthLabel, billNo, rows:[{date,liters,rate,amount}],
//         totalLiters, totalAmount, received, balance, genText }
export async function renderBill(bill) {
  await ensureFonts()

  const W = 800
  const padX = 40
  const headerH = 120
  const buyerH = 110
  const dividerH = 4
  const headRowH = 56
  const rowH = 46
  const nRows = Math.max(bill.rows.length, 1)
  const tableH = headRowH + nRows * rowH
  const totalsH = 240
  const footerH = 90
  const H = headerH + buyerH + dividerH + tableH + totalsH + footerH

  const scale = 2 // hi-dpi for crisp text
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'middle'

  const ur = (size, w = 600) => { ctx.font = `${w} ${size}px ${FONT_UR}`; ctx.direction = 'rtl' }
  const num = (size, w = 600) => { ctx.font = `${w} ${size}px ${FONT_MONO}`; ctx.direction = 'ltr' }

  // white background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)

  let y = 0

  // 1 — header band
  ctx.fillStyle = C.green
  ctx.fillRect(0, 0, W, headerH)
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'; ur(42, 700)
  ctx.fillText(bill.farmName, W / 2, headerH / 2 - 8)
  ur(22, 500)
  ctx.fillText('ڈیری بک', W / 2, headerH / 2 + 30)
  ctx.textAlign = 'left'; ctx.font = '46px sans-serif'
  ctx.fillText('🐄', padX - 6, headerH / 2)
  y = headerH

  // 2 — buyer info (cream)
  ctx.fillStyle = C.cream
  ctx.fillRect(0, y, W, buyerH)
  ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ur(34, 700)
  ctx.fillText(bill.buyerName, W - padX, y + 40)
  ctx.fillStyle = C.muted; ur(25, 500)
  ctx.fillText(bill.monthLabel, W - padX, y + 78)
  ctx.fillStyle = C.muted; ctx.textAlign = 'left'; num(22, 600)
  ctx.fillText('Bill #' + bill.billNo, padX, y + 78)
  y += buyerH

  // 3 — amber divider
  ctx.fillStyle = C.amber
  ctx.fillRect(0, y, W, dividerH)
  y += dividerH

  // 4 — table  (RTL columns: تاریخ | لیٹر | ریٹ | رقم)
  const xDate = W - padX
  const xLiters = W - 330
  const xRate = W - 500
  const xAmount = padX + 170
  // header row
  ctx.fillStyle = C.green
  ctx.fillRect(0, y, W, headRowH)
  ctx.fillStyle = '#FFFFFF'; ur(25, 600); ctx.textAlign = 'right'
  ctx.fillText('تاریخ', xDate, y + headRowH / 2)
  ctx.fillText('لیٹر', xLiters, y + headRowH / 2)
  ctx.fillText('ریٹ', xRate, y + headRowH / 2)
  ctx.fillText('رقم', xAmount, y + headRowH / 2)
  y += headRowH
  // data rows
  bill.rows.forEach((r, i) => {
    const ry = y + i * rowH
    ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : C.zebra
    ctx.fillRect(0, ry, W, rowH)
    const cy = ry + rowH / 2
    ctx.fillStyle = C.ink
    ur(23, 500); ctx.textAlign = 'right'
    ctx.fillText(r.date, xDate, cy)
    num(23, 600); ctx.textAlign = 'right'
    ctx.fillText(r.liters + 'L', xLiters, cy)
    ctx.fillText('₨' + r.rate, xRate, cy)
    ctx.fillText('₨' + Number(r.amount).toLocaleString('en-PK'), xAmount, cy)
  })
  if (bill.rows.length === 0) {
    ctx.fillStyle = C.muted; ur(24, 500); ctx.textAlign = 'center'
    ctx.fillText('اس ماہ کوئی ترسیل نہیں', W / 2, y + rowH / 2)
  }
  y += nRows * rowH

  // 5 — totals (light green)
  ctx.fillStyle = C.lightGreen
  ctx.fillRect(0, y, W, totalsH)
  const labelX = W - padX
  const valX = padX
  const line = (label, value, color, big) => {
    ctx.fillStyle = C.ink; ur(big ? 30 : 26, big ? 700 : 600); ctx.textAlign = 'right'
    ctx.fillText(label, labelX, y)
    ctx.fillStyle = color; num(big ? 32 : 26, big ? 700 : 600); ctx.textAlign = 'left'
    ctx.fillText(value, valX, y)
  }
  y += 42
  line('کل لیٹر', Number(bill.totalLiters).toLocaleString('en-PK') + ' L', C.ink, false)
  y += 50
  line('کل رقم', '₨' + Number(bill.totalAmount).toLocaleString('en-PK'), C.ink, true)
  y += 52
  line('موصولہ', '₨' + Number(bill.received).toLocaleString('en-PK'), C.ok, false)
  y += 50
  line('باقی رقم', '₨' + Number(bill.balance).toLocaleString('en-PK'), bill.balance > 0 ? C.danger : C.ok, true)
  y += totalsH - 194

  // 6 — footer band
  ctx.fillStyle = C.green
  ctx.fillRect(0, y, W, footerH)
  ctx.fillStyle = '#FFFFFF'; ur(24, 600); ctx.textAlign = 'center'
  ctx.fillText('ڈیری بک — آپ کا ڈیجیٹل فارم مددگار', W / 2, y + 34)
  num(18, 500)
  ctx.fillText(bill.genText, W / 2, y + 64)

  const dataUrl = canvas.toDataURL('image/png')
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return { blob, dataUrl, width: W, height: H }
}
