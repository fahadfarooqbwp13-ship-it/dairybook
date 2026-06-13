import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees, liters } from '../../lib/format.js'
import { today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'

const DOT = { overdue: '🔴', soon: '🟡', ok: '🟢' }
const ORDER = { overdue: 0, soon: 1, ok: 2 }

export default function BuyerList() {
  const nav = useNavigate()
  const { t } = useT()
  const s = useStore()
  const addBuyer = useStore((st) => st.addBuyer)
  const show = useToast((st) => st.show)
  const [adding, setAdding] = useState(false)
  const [nf, setNf] = useState({ name: '', phone: '', dailyQty: '', rate: '' })

  const month = today().slice(0, 7)
  const rows = s.buyers
    .map((b) => {
      const due = sel.buyerDue(s, b)
      const todayL = s.deliveries
        .filter((d) => d.buyerId === b.id && d.date === today())
        .reduce((x, d) => x + d.liters, 0)
      const monthAmt = s.deliveries
        .filter((d) => d.buyerId === b.id && d.date.startsWith(month))
        .reduce((x, d) => x + d.amount, 0)
      return { b, due, todayL, monthAmt }
    })
    .sort((a, c) => ORDER[a.due.status] - ORDER[c.due.status] || c.due.balance - a.due.balance)

  const receivable = sel.totalReceivable(s)

  function saveBuyer() {
    if (!nf.name.trim()) return
    addBuyer({
      name: nf.name.trim(),
      phone: nf.phone.trim(),
      dailyQty: +nf.dailyQty || 0,
      rate: +nf.rate || 0,
      cycleDays: 7,
    })
    show(t('saved_ok'), true)
    setNf({ name: '', phone: '', dailyQty: '', rate: '' })
    setAdding(false)
  }

  return (
    <div className="pb-6">
      <PageHeader
        title={t('buyers_title')}
        color="bg-gold"
        action={
          <button
            onClick={() => setAdding((v) => !v)}
            className="gs-touch bg-white/25 rounded-full font-bold text-2xl flex items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            {adding ? '×' : '+'}
          </button>
        }
      />

      {/* total receivable */}
      <div className="px-4 mt-3">
        <div className="gs-card p-4 text-center" style={{ background: '#FFF7E0' }}>
          <div className="font-urdu text-lg text-muted">{t('buyers_totalReceivable')}</div>
          <div className="num text-4xl font-bold text-[#8a6d00]">{rupees(receivable)}</div>
        </div>
      </div>

      {/* distribute today's milk */}
      <div className="px-4 mt-3">
        <button onClick={() => nav('/buyers/distribute')} className="gs-btn bg-gold text-ink w-full">
          🥛 {t('buyers_distribute')}
        </button>
      </div>

      {/* inline add buyer */}
      {adding && (
        <div className="px-4 mt-3">
          <div className="gs-card p-3 space-y-2">
            <input className="gs-input font-urdu" placeholder={t('buyers_title')} value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} />
            <input className="gs-input num" inputMode="tel" placeholder={t('buyers_phone')} value={nf.phone} onChange={(e) => setNf({ ...nf, phone: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="gs-input num" inputMode="numeric" placeholder={t('buyers_dailyQty')} value={nf.dailyQty} onChange={(e) => setNf({ ...nf, dailyQty: e.target.value })} />
              <input className="gs-input num" inputMode="numeric" placeholder={t('buyers_rate')} value={nf.rate} onChange={(e) => setNf({ ...nf, rate: e.target.value })} />
            </div>
            <button onClick={saveBuyer} className="gs-btn bg-ok text-white w-full">✅ {t('save')}</button>
          </div>
        </div>
      )}

      {/* buyers list */}
      <div className="px-4 mt-3 space-y-2">
        {rows.map(({ b, due, todayL, monthAmt }) => (
          <button
            key={b.id}
            onClick={() => nav(`/buyers/${b.id}`)}
            className="gs-card w-full p-3 text-start active:scale-[0.99] transition"
            style={{ borderInlineStart: `6px solid ${due.status === 'overdue' ? '#B71C1C' : due.status === 'soon' ? '#F57F17' : '#2E7D32'}` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-urdu text-xl font-bold text-ink flex items-center gap-2 min-w-0">
                <span className="shrink-0">{DOT[due.status]}</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className={`num text-2xl font-bold shrink-0 ${due.balance > 0 ? 'text-danger' : 'text-ok'}`}>
                {rupees(due.balance)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 font-urdu text-sm text-muted">
              <span>{t('today')}: <span className="num">{liters(todayL)}</span></span>
              <span>اس ماہ: <span className="num">{rupees(monthAmt)}</span></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
