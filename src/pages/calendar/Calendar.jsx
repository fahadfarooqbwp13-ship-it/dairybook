import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useT } from '../../i18n/useT.js'
import { ymd, monthName, today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'

const DOT = {
  milk: '#0277BD', sale: '#F9A825', expense: '#B71C1C',
  breeding: '#7B1FA2', calving: '#2E7D32', health: '#E65100', vaccine: '#AD1457',
}
const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function Calendar() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const s = useStore()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const events = sel.calendarEvents(s, ym.y, ym.m)
  const first = new Date(ym.y, ym.m, 1)
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const lead = first.getDay() // 0=Sun
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const shift = (d) => {
    const nm = new Date(ym.y, ym.m + d, 1)
    setYm({ y: nm.getFullYear(), m: nm.getMonth() })
  }
  const weekdays = lang === 'ur' ? WEEKDAYS_UR.map((w) => w.slice(0, 3)) : WEEKDAYS_EN

  return (
    <div className="pb-8">
      <PageHeader title={t('cal_title')} color="bg-grape" />

      {/* month nav */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="gs-touch rounded-full bg-white text-2xl flex items-center justify-center" style={{ width: 44, height: 44 }}>›</button>
        <div className="font-urdu text-xl font-bold">{monthName(ym.m, lang)} <span className="num">{ym.y}</span></div>
        <button onClick={() => shift(1)} className="gs-touch rounded-full bg-white text-2xl flex items-center justify-center" style={{ width: 44, height: 44 }}>‹</button>
      </div>

      {/* grid — tap any day → that day's full record */}
      <div className="px-4 mt-3">
        <div className="gs-card p-2">
          <div className="grid grid-cols-7 mb-1">
            {weekdays.map((w, i) => (
              <div key={i} className="text-center font-urdu text-xs text-muted py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />
              const date = ymd(new Date(ym.y, ym.m, day))
              const tags = events[date] ? [...events[date]] : []
              const isToday = date === today()
              return (
                <button
                  key={i}
                  onClick={() => nav(`/day/${date}`)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center ${isToday ? 'bg-grape/15 ring-1 ring-grape' : 'bg-cream/60'}`}
                >
                  <span className="num text-base font-bold text-ink">{day}</span>
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {tags.slice(0, 4).map((tg, j) => (
                      <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: DOT[tg] }} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="px-4 mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {[['milk', 'دودھ'], ['sale', 'فروخت'], ['expense', 'خرچ'], ['breeding', 'افزائش'], ['calving', 'بچہ'], ['health', 'صحت'], ['vaccine', 'ٹیکہ']].map(([k, label]) => (
          <span key={k} className="flex items-center gap-1 font-urdu text-xs text-muted">
            <span className="w-2 h-2 rounded-full" style={{ background: DOT[k] }} /> {label}
          </span>
        ))}
      </div>

      <div className="px-4 mt-4 text-center font-urdu text-base text-muted">
        👆 کسی بھی دن کو دبائیں — اس دن کا پورا ریکارڈ دیکھیں
      </div>
    </div>
  )
}
