import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees, liters, lnum } from '../../lib/format.js'
import { today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'

export default function Distribute() {
  const nav = useNavigate()
  const { t } = useT()
  const s = useStore()
  const distribute = useStore((st) => st.distribute)
  const show = useToast((st) => st.show)

  const produced = sel.todayMilk(s)

  // initial allocation: today's existing delivery, else usual daily quantity
  const [alloc, setAlloc] = useState(() => {
    const m = {}
    s.buyers.forEach((b) => {
      const existing = s.deliveries
        .filter((d) => d.buyerId === b.id && d.date === today())
        .reduce((x, d) => x + d.liters, 0)
      m[b.id] = existing || b.dailyQty || 0
    })
    return m
  })

  const step = (id, d) => setAlloc((p) => ({ ...p, [id]: Math.max(0, +(((p[id] || 0) + d).toFixed(1))) }))
  const assigned = Object.values(alloc).reduce((x, v) => x + (+v || 0), 0)
  const remaining = +(produced - assigned).toFixed(1)

  function confirmDistribution() {
    distribute(
      today(),
      s.buyers.map((b) => ({ buyerId: b.id, liters: alloc[b.id] || 0 })),
    )
    show(t('saved_ok'), true)
    nav('/buyers')
  }

  return (
    <div className="pb-8">
      <PageHeader title={t('buyers_distribute')} color="bg-gold" />

      {/* produced + remaining */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="gs-card p-3 text-center">
          <div className="font-urdu text-base text-muted">{t('milk_herdTotalToday')}</div>
          <div className="num text-3xl font-bold text-sky">{liters(produced)}</div>
        </div>
        <div className={`gs-card p-3 text-center ${remaining < 0 ? 'ring-2 ring-danger' : ''}`}>
          <div className="font-urdu text-base text-muted">{t('buyers_remaining')} ({t('buyers_home')})</div>
          <div className={`num text-3xl font-bold ${remaining < 0 ? 'text-danger' : 'text-ok'}`}>{liters(remaining)}</div>
        </div>
      </div>

      {/* per-buyer steppers */}
      <div className="px-4 mt-4 space-y-2">
        {s.buyers.map((b) => {
          const l = alloc[b.id] || 0
          return (
            <div key={b.id} className="gs-card p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-urdu text-lg font-bold text-ink truncate">{b.name}</div>
                <div className="num text-sm text-muted">{rupees(Math.round(l * b.rate))} · {rupees(b.rate)}/L</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => step(b.id, -0.5)} className="gs-touch rounded-full bg-cream text-2xl font-bold text-accent flex items-center justify-center" style={{ width: 48, height: 48 }}>−</button>
                <span className="num text-2xl font-bold w-12 text-center">{lnum(l)}</span>
                <button onClick={() => step(b.id, 0.5)} className="gs-touch rounded-full bg-primary text-2xl font-bold text-white flex items-center justify-center" style={{ width: 48, height: 48 }}>+</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 mt-4">
        <button onClick={confirmDistribution} className="gs-btn bg-ok text-white text-2xl w-full">✅ {t('confirm')}</button>
      </div>
    </div>
  )
}
