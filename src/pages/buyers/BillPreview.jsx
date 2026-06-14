import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees, liters } from '../../lib/format.js'
import { renderBill } from '../../lib/billImage.js'
import { shareImage, downloadBlob } from '../../lib/share.js'
import { saveBill, billId } from '../../lib/billsDb.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'

export default function BillPreview() {
  const { id, ym } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const show = useToast((st) => st.show)
  const buyer = s.buyers.find((b) => b.id === id)
  const [year, monthRaw] = (ym || '').split('-')
  const month = +monthRaw - 1

  const [img, setImg] = useState(null) // { dataUrl, blob }
  const [busy, setBusy] = useState(true)

  const bill = buyer ? sel.buyerMonthBill(s, id, +year, month, lang) : null

  const generate = useCallback(async () => {
    if (!buyer || !bill) return
    setBusy(true)
    const now = new Date()
    const genText = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    const result = await renderBill({
      farmName: s.farmName,
      buyerName: buyer.name,
      monthLabel: bill.monthLabel,
      billNo: `${year}${String(month + 1).padStart(2, '0')}`,
      rows: bill.rows,
      totalLiters: bill.totalLiters,
      totalAmount: bill.totalAmount,
      received: bill.received,
      balance: bill.balance,
      genText,
    })
    setImg(result)
    setBusy(false)
    // archive the PNG forever (per buyer per month), offline
    try {
      await saveBill({
        id: billId(id, +year, month + 1),
        buyerId: id,
        year: +year,
        month,
        monthLabel: bill.monthLabel,
        totalLiters: bill.totalLiters,
        totalAmount: bill.totalAmount,
        balance: bill.balance,
        blob: result.blob,
        createdAt: new Date().toISOString(),
      })
    } catch {
      /* archiving is best-effort */
    }
  }, [id, ym]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { generate() }, [generate])

  if (!buyer) {
    return (
      <div>
        <PageHeader title="—" color="bg-gold" />
        <p className="font-urdu text-lg text-muted text-center mt-10">خریدار نہیں ملا</p>
      </div>
    )
  }

  const filename = `bill-${buyer.name}-${ym}.png`

  async function onShare() {
    if (!img) return
    const res = await shareImage(img.blob, filename, {
      title: 'بل',
      text: `${buyer.name} — ${bill.monthLabel}\nباقی: ${rupees(bill.balance)}`,
    })
    if (res === 'downloaded') show(lang === 'ur' ? 'تصویر محفوظ ہو گئی — واٹس ایپ میں خود بھیجیں' : 'Image saved — send it on WhatsApp', false)
  }

  return (
    <div className="pb-8">
      <PageHeader title={`📄 ${bill.monthLabel}`} color="bg-gold" />

      {/* quick summary */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="کل لیٹر" value={liters(bill.totalLiters)} />
        <Mini label="کل رقم" value={rupees(bill.totalAmount)} />
        <Mini label="باقی" value={rupees(bill.balance)} danger={bill.balance > 0} />
      </div>

      {/* image preview */}
      <div className="px-4 mt-3">
        <div className="rounded-card overflow-hidden border-2 border-black/10 bg-white min-h-[200px] flex items-center justify-center">
          {busy ? (
            <div className="font-urdu text-lg text-muted py-16">📄 بل بن رہا ہے…</div>
          ) : (
            <img src={img.dataUrl} alt="bill" className="w-full block" />
          )}
        </div>
      </div>

      {/* actions */}
      <div className="px-4 mt-4 space-y-2">
        <button onClick={onShare} disabled={busy} className="gs-btn bg-[#25D366] text-white w-full text-xl disabled:opacity-50">
          🟢 {lang === 'ur' ? 'واٹس ایپ پر بل بھیجیں' : 'Send bill on WhatsApp'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => img && downloadBlob(img.blob, filename)} disabled={busy} className="gs-btn bg-white text-primary border-2 border-primary/20 disabled:opacity-50">
            💾 {lang === 'ur' ? 'محفوظ کریں' : 'Save'}
          </button>
          <button onClick={generate} disabled={busy} className="gs-btn bg-white text-muted border-2 border-black/10 disabled:opacity-50">
            🔄 {lang === 'ur' ? 'دوبارہ بنائیں' : 'Regenerate'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Mini({ label, value, danger }) {
  return (
    <div className="gs-card p-2">
      <div className={`num text-base font-bold ${danger ? 'text-danger' : 'text-ink'}`}>{value}</div>
      <div className="font-urdu text-xs text-muted">{label}</div>
    </div>
  )
}
