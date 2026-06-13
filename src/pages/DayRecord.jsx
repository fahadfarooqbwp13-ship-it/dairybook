import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useEditor } from '../store/useEditor.js'
import { useT } from '../i18n/useT.js'
import { rupees, liters, lnum } from '../lib/format.js'
import { longDate, addDays, today } from '../lib/date.js'
import * as sel from '../store/selectors.js'
import PageHeader from '../components/PageHeader.jsx'

export default function DayRecord() {
  const { date } = useParams()
  const d = date || today()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const open = useEditor((st) => st.open)
  const rec = sel.dayRecords(s, d, lang)

  const go = (delta) => nav(`/day/${addDays(d, delta)}`)

  return (
    <div className="pb-8">
      <PageHeader title={longDate(d, lang)} color="bg-grape" />

      {/* day navigation + date picker */}
      <div className="px-4 mt-3 flex items-center gap-2">
        <button onClick={() => go(-1)} className="gs-btn bg-white text-grape border-2 border-grape/20 flex-1 text-base" style={{ minHeight: 48 }}>‹ پچھلا دن</button>
        <label className="gs-touch rounded-card bg-white border-2 border-grape/20 flex items-center justify-center px-3" style={{ minHeight: 48 }}>
          <span className="text-xl">📅</span>
          <input type="date" value={d} onChange={(e) => e.target.value && nav(`/day/${e.target.value}`)} className="num text-sm w-0 opacity-0 absolute" />
        </label>
        <button onClick={() => go(1)} className="gs-btn bg-white text-grape border-2 border-grape/20 flex-1 text-base" style={{ minHeight: 48 }}>اگلا دن ›</button>
      </div>

      {rec.count === 0 ? (
        <div className="px-4 mt-10 text-center font-urdu text-lg text-muted">اس دن کوئی ریکارڈ نہیں</div>
      ) : (
        <div className="px-4 mt-3 space-y-3">
          {/* milk */}
          {(rec.milkLogs.length > 0 || rec.bulk) && (
            <Section icon="🥛" title="دودھ">
              {rec.milkLogs.map((m) => (
                <Row key={m.id} onClick={() => open(m.collection, m.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{m.name}</span>
                  <span className="num text-sm text-muted shrink-0">صبح {lnum(m.morning)} · شام {lnum(m.evening)}</span>
                  <span className="num text-base font-bold text-sky shrink-0 w-12 text-end">{lnum(m.total)}</span>
                </Row>
              ))}
              {rec.bulk && (
                <Row onClick={() => open('bulkMilk', rec.bulk.id)}>
                  <span className="font-urdu text-base flex-1">کل دودھ (مجموعی)</span>
                  <span className="num text-sm text-muted shrink-0">صبح {lnum(rec.bulk.morning)} · شام {lnum(rec.bulk.evening)}</span>
                </Row>
              )}
              <div className="px-3 py-2 font-urdu text-base font-bold text-sky flex justify-between">
                <span>کل</span><span className="num">{liters(rec.milkTotal)}</span>
              </div>
            </Section>
          )}

          {/* sales */}
          {rec.sales.length > 0 && (
            <Section icon="💰" title="فروخت (خریداروں کو)">
              {rec.sales.map((d2) => (
                <Row key={d2.id} onClick={() => open(d2.collection, d2.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{d2.buyerName}</span>
                  <span className="num text-sm text-muted shrink-0">{lnum(d2.liters)}L × ₨{d2.rate}</span>
                  <span className="num text-base font-bold text-ink shrink-0 w-20 text-end">{rupees(d2.amount)}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* health */}
          {rec.health.length > 0 && (
            <Section icon="💊" title="صحت">
              {rec.health.map((h) => (
                <Row key={h.id} onClick={() => open(h.collection, h.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{h.name}</span>
                  <span className="font-urdu text-sm text-muted shrink-0 truncate max-w-[55%]">{h.label}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* expenses */}
          {rec.expenses.length > 0 && (
            <Section icon="🧾" title="اخراجات">
              {rec.expenses.map((e) => (
                <Row key={e.id} onClick={() => open(e.collection, e.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{e.icon} {e.label}</span>
                  <span className="num text-base font-bold text-danger shrink-0">{rupees(e.amount)}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* breeding */}
          {rec.breeding.length > 0 && (
            <Section icon="🍼" title="افزائش">
              {rec.breeding.map((bv) => (
                <Row key={bv.id} onClick={() => open(bv.collection, bv.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{bv.name}</span>
                  <span className="font-urdu text-sm text-muted shrink-0">{bv.label}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* vaccinations */}
          {rec.vaccinations.length > 0 && (
            <Section icon="💉" title="ٹیکے">
              {rec.vaccinations.map((v) => (
                <Row key={v.id} onClick={() => open(v.collection, v.id)}>
                  <span className="font-urdu text-base flex-1 min-w-0 truncate">{v.name}</span>
                  <span className="font-urdu text-sm text-muted shrink-0">{v.label}</span>
                </Row>
              ))}
            </Section>
          )}

          {/* net */}
          <div className="gs-card p-4" style={{ background: '#E8F5E9' }}>
            <div className="flex justify-between font-urdu text-base">
              <span>آمدن: <span className="num font-bold text-ok">{rupees(rec.income)}</span></span>
              <span>خرچ: <span className="num font-bold text-danger">{rupees(rec.expenseTotal)}</span></span>
            </div>
            <div className="font-urdu text-xl font-bold mt-2 text-center">
              منافع: <span className={`num ${rec.profit >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(rec.profit)}</span> {rec.profit >= 0 ? '✅' : '🔴'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="gs-card overflow-hidden">
      <div className="bg-grape/10 px-3 py-2 font-urdu text-lg font-bold text-grape">{icon} {title}</div>
      <div className="divide-y divide-black/5">{children}</div>
    </div>
  )
}

function Row({ onClick, children }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2.5 text-start active:bg-black/5">
      {children}
    </button>
  )
}
