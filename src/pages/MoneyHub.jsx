import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useT } from '../i18n/useT.js'
import { rupees } from '../lib/format.js'
import * as sel from '../store/selectors.js'
import PageHeader from '../components/PageHeader.jsx'

// One "paisa" hub: money in, money out, balance + the finance actions.
export default function MoneyHub() {
  const nav = useNavigate()
  const { lang } = useT()
  const s = useStore()

  const receivable = sel.totalReceivable(s)
  const todayIn = sel.todayIncome(s)
  const mo = sel.monthStats(s, 0)

  const ACTIONS = [
    { icon: '🥛', to: '/buyers/distribute', label: 'دودھ تقسیم کریں', color: 'bg-gold text-ink' },
    { icon: '💰', to: '/buyers', label: 'خریدار اور کھاتے', color: 'bg-white text-ink border-2 border-black/5' },
    { icon: '🧾', to: '/expenses', label: 'اخراجات', color: 'bg-white text-ink border-2 border-black/5' },
    { icon: '📈', to: '/profit', label: 'منافع دیکھیں', color: 'bg-white text-ink border-2 border-black/5' },
    { icon: '🛒', to: '/trade', label: 'خرید و فروخت', color: 'bg-white text-ink border-2 border-black/5' },
    { icon: '📊', to: '/reports', label: 'رپورٹیں', color: 'bg-white text-ink border-2 border-black/5' },
  ]

  return (
    <div className="pb-8">
      <PageHeader title="مالیہ" color="bg-gold" />

      {/* balance hero */}
      <div className="px-4 mt-3">
        <div className="gs-card p-5 text-center" style={{ background: '#FFF7E0' }}>
          <div className="font-urdu text-lg text-muted">کل وصول ہونے والی رقم</div>
          <div className="num text-4xl font-bold text-[#8a6d00]">{rupees(receivable)}</div>
        </div>
      </div>

      {/* in / out this month */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <div className="gs-card p-3 text-center" style={{ borderInlineStart: '6px solid #2E7D32' }}>
          <div className="font-urdu text-base text-muted">اس ماہ آمدن</div>
          <div className="num text-2xl font-bold text-ok">{rupees(mo.revenue)}</div>
        </div>
        <div className="gs-card p-3 text-center" style={{ borderInlineStart: '6px solid #B71C1C' }}>
          <div className="font-urdu text-base text-muted">اس ماہ خرچ</div>
          <div className="num text-2xl font-bold text-danger">{rupees(mo.expense)}</div>
        </div>
      </div>

      {/* net profit */}
      <div className="px-4 mt-3">
        <button onClick={() => nav('/profit')} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <div className="text-start">
            <div className="font-urdu text-lg text-muted">اس ماہ خالص منافع</div>
            <div className={`num text-3xl font-bold ${mo.profit >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(mo.profit)}</div>
          </div>
          <span className="font-urdu text-base text-primary">تفصیل ›</span>
        </button>
      </div>

      <div className="px-4 mt-2 font-urdu text-sm text-muted">آج کی آمدن: <span className="num">{rupees(todayIn)}</span></div>

      {/* actions */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <button key={a.to} onClick={() => nav(a.to)} className={`gs-btn ${a.color} flex-col gap-1 py-3`} style={{ minHeight: 84 }}>
            <span style={{ fontSize: 30 }}>{a.icon}</span>
            <span className="font-urdu text-base">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
