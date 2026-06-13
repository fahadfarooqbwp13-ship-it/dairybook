import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useT } from '../../i18n/useT.js'
import { liters, lnum } from '../../lib/format.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'

const BAND = {
  high: { dot: '🟢', text: 'text-ok' },
  avg: { dot: '🟡', text: 'text-warn' },
  low: { dot: '🔴', text: 'text-danger' },
}

export default function MilkHerd() {
  const nav = useNavigate()
  const { t } = useT()
  const s = useStore()
  const { rows, avg, total } = sel.herdDay(s)
  const max = rows.reduce((m, r) => Math.max(m, r.liters), 0) || 1

  return (
    <div className="pb-6">
      <PageHeader title={t('milk_herd')} color="bg-sky" />

      {/* today total + log button */}
      <div className="px-4 mt-4">
        <div className="gs-card p-4 flex items-center justify-between">
          <div>
            <div className="font-urdu text-lg text-muted">{t('milk_herdTotalToday')}</div>
            <div className="num text-4xl font-bold text-sky">{liters(total)}</div>
            <div className="font-urdu text-sm text-muted mt-1">
              {t('milk_avg')}: <span className="num">{lnum(avg)}L</span> / {rows.filter((r) => r.liters > 0).length} {t('animals_count')}
            </div>
          </div>
          <button onClick={() => nav('/milk/log')} className="gs-btn bg-sky text-white px-4">
            🥛 {t('milk_tapToLog')}
          </button>
        </div>
      </div>

      {/* ranked producers */}
      <div className="px-4 mt-4 space-y-2">
        {rows.map((r) => {
          const band = BAND[r.band]
          return (
            <button
              key={r.animal.id}
              onClick={() => nav(`/milk/animal/${r.animal.id}`)}
              className="gs-card w-full p-3 flex items-center gap-3 text-start active:scale-[0.99] transition"
            >
              <AnimalAvatar animal={r.animal} size={52} />
              <div className="flex-1 min-w-0">
                <div className="font-urdu text-lg font-bold text-ink truncate">
                  {r.animal.name || `نمبر ${r.animal.tag}`}
                </div>
                {/* visual bar */}
                <div className="h-2.5 bg-cream rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(r.liters / max) * 100}%`,
                      background: r.band === 'high' ? '#2E7D32' : r.band === 'low' ? '#B71C1C' : '#F9A825',
                    }}
                  />
                </div>
              </div>
              <div className="text-end">
                <div className={`num text-2xl font-bold ${band.text}`}>{lnum(r.liters)}</div>
                <div className="text-base">{band.dot}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
