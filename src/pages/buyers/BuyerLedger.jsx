import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees, liters, num } from '../../lib/format.js'
import { shortDate, agoText, today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import NumberPad from '../../components/NumberPad.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function BuyerLedger() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const recordPayment = useStore((st) => st.recordPayment)
  const show = useToast((st) => st.show)
  const b = s.buyers.find((x) => x.id === id)
  const [pay, setPay] = useState(null) // payment amount string when panel open

  if (!b) {
    return (
      <div>
        <PageHeader title="—" color="bg-gold" />
        <p className="font-urdu text-lg text-muted text-center mt-10">خریدار نہیں ملا</p>
      </div>
    )
  }

  const due = sel.buyerDue(s, b)
  const deliveries = sel.buyerDeliveries(s, b.id).slice().sort((x, y) => (x.date < y.date ? 1 : -1))
  const payments = sel.buyerPayments(s, b.id).slice().sort((x, y) => (x.date < y.date ? 1 : -1))
  const overdue = due.status === 'overdue'

  function confirmPay() {
    const amt = +pay || 0
    if (amt <= 0) return setPay(null)
    recordPayment(b.id, amt)
    show(t('saved_ok'), true)
    setPay(null)
  }

  // current month for "send bill", plus every month's bill for the history
  const curYm = today().slice(0, 7)
  const monthlyBills = sel.buyerMonthlyBills(s, b.id, lang)

  return (
    <div className="pb-8">
      <PageHeader
        title={b.name}
        color="bg-gold"
        action={
          <div className="flex items-center gap-1">
            <EditBtn collection="buyers" id={b.id} className="!text-white" />
            {b.phone && (
              <a href={`tel:${b.phone}`} className="gs-touch bg-white/25 rounded-full flex items-center justify-center" style={{ width: 44, height: 44 }}>
                📞
              </a>
            )}
          </div>
        }
      />

      {/* balance card */}
      <div className="px-4 mt-4">
        <div className={`gs-card p-5 text-center ${overdue ? 'ring-2 ring-danger' : ''}`}>
          <div className="font-urdu text-lg text-muted">{t('buyers_balance')}</div>
          <div className={`num text-5xl font-bold ${due.balance > 0 ? 'text-danger' : 'text-ok'}`}>
            {rupees(due.balance)}
          </div>
          <div className="font-urdu text-base text-muted mt-2">
            {t('buyers_lastPayment')}: {agoText(due.lastPay, lang)}
          </div>
          <div className="font-urdu text-sm text-muted mt-1">
            {t('buyers_rate')}: <span className="num">{rupees(b.rate)}</span> · {t('buyers_dailyQty')}: <span className="num">{liters(b.dailyQty)}</span>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => setPay('')} className="gs-btn bg-ok text-white">💵 {t('buyers_recordPayment')}</button>
        <button onClick={() => nav(`/buyers/${b.id}/bill/${curYm}`)} className="gs-btn bg-[#25D366] text-white">
          📄 بل بھیجیں
        </button>
      </div>

      {/* payment panel */}
      {pay !== null && (
        <div className="px-4 mt-3">
          <div className="gs-card p-3">
            <div className="font-urdu text-lg text-muted mb-1">{t('buyers_amountReceived')}</div>
            <div className="num text-4xl font-bold text-ok text-center mb-2">{rupees(+pay || 0)}</div>
            <NumberPad value={pay} onChange={setPay} allowDecimal={false} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => setPay(null)} className="gs-btn bg-white text-muted border-2 border-black/10">{t('cancel')}</button>
              <button onClick={confirmPay} className="gs-btn bg-ok text-white">✅ {t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* past bills history */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📄 پرانے بل</h3>
        <div className="gs-card divide-y divide-black/5">
          {monthlyBills.length === 0 ? (
            <div className="px-4 py-3 font-urdu text-muted">ابھی کوئی بل نہیں</div>
          ) : (
            monthlyBills.map((mb) => (
              <button
                key={`${mb.year}-${mb.month}`}
                onClick={() => nav(`/buyers/${b.id}/bill/${mb.year}-${String(mb.month + 1).padStart(2, '0')}`)}
                className="w-full px-3 py-2.5 text-start active:bg-black/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-urdu text-base font-bold truncate">{mb.monthLabel}</span>
                  <span className="num text-base font-bold text-ink shrink-0">{rupees(mb.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="num text-sm text-muted">{liters(mb.totalLiters)}</span>
                  <span className={`font-urdu text-sm shrink-0 ${mb.paid ? 'text-ok' : 'text-danger'}`}>
                    {mb.paid ? '✅ ادا شدہ' : `🔴 ${rupees(mb.balance)} باقی`}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* deliveries */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📦 {t('buyers_deliveries')}</h3>
        <div className="gs-card divide-y divide-black/5 max-h-72 overflow-y-auto">
          {deliveries.slice(0, 40).map((d) => (
            <div key={d.id} className="flex items-center gap-2 px-3 py-2">
              <span className="font-urdu text-sm text-muted shrink-0 w-14">{shortDate(d.date, lang)}</span>
              <span className="num text-sm text-ink flex-1 text-center">{liters(d.liters)} × {rupees(d.rate)}</span>
              <span className="num text-base font-bold text-ink shrink-0">{rupees(d.amount)}</span>
              <EditBtn collection="deliveries" id={d.id} />
            </div>
          ))}
        </div>
      </div>

      {/* payments */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">💵 {t('buyers_payments')}</h3>
        <div className="gs-card divide-y divide-black/5">
          {payments.length === 0 ? (
            <div className="px-4 py-3 font-urdu text-muted">—</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2">
                <span className="font-urdu text-sm text-muted shrink-0 w-14">{shortDate(p.date, lang)}</span>
                <span className="font-urdu text-sm text-muted flex-1 text-center truncate">{p.note}</span>
                <span className="num text-base font-bold text-ok shrink-0">{rupees(p.amount)}</span>
                <EditBtn collection="payments" id={p.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
