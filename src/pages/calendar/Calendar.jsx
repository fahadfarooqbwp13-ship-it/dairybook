import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { ymd, monthName, today, shortDate, addDays, daysBetween } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { ensureNotifyPermission } from '../../lib/notify.js'
import PageHeader from '../../components/PageHeader.jsx'

const DOT = {
  milk: '#0277BD', sale: '#F9A825', expense: '#B71C1C',
  breeding: '#7B1FA2', calving: '#2E7D32', health: '#E65100', vaccine: '#AD1457', alert: '#FF6D00',
}
const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function Calendar() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const s = useStore()
  const addCustomAlert = useStore((st) => st.addCustomAlert)
  const removeCustomAlert = useStore((st) => st.removeCustomAlert)
  const show = useToast((st) => st.show)
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [adding, setAdding] = useState(false)
  const [aDate, setADate] = useState(today())
  const [aText, setAText] = useState('')
  const [listening, setListening] = useState(false)

  const events = sel.calendarEvents(s, ym.y, ym.m)
  const alerts = s.customAlerts || []
  const alertDates = new Set(alerts.map((a) => a.date))
  const first = new Date(ym.y, ym.m, 1)
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const lead = first.getDay()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const weekdays = lang === 'ur' ? WEEKDAYS_UR.map((w) => w.slice(0, 3)) : WEEKDAYS_EN

  const upcoming = alerts
    .filter((a) => a.date >= today())
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const shift = (d) => {
    const nm = new Date(ym.y, ym.m + d, 1)
    setYm({ y: nm.getFullYear(), m: nm.getMonth() })
  }

  async function saveAlert() {
    if (!aText.trim()) return
    await ensureNotifyPermission()
    addCustomAlert(aDate, aText)
    show(lang === 'ur' ? 'یاد دہانی محفوظ ہو گئی 🔔' : 'Reminder saved 🔔', false)
    setAText(''); setADate(today()); setAdding(false)
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      show(lang === 'ur' ? 'آواز اس فون پر دستیاب نہیں' : 'Voice not available', false)
      return
    }
    const rec = new SR()
    rec.lang = lang === 'ur' ? 'ur-PK' : 'en-US'
    rec.interimResults = false
    setListening(true)
    rec.onresult = (e) => setAText((p) => (p ? p + ' ' : '') + e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    try { rec.start() } catch { setListening(false) }
  }

  return (
    <div className="pb-8">
      <PageHeader title={t('cal_title')} color="bg-grape" />

      {/* month nav */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="gs-touch rounded-full bg-white text-2xl flex items-center justify-center" style={{ width: 44, height: 44 }}>›</button>
        <div className="font-urdu text-xl font-bold">{monthName(ym.m, lang)} <span className="num">{ym.y}</span></div>
        <button onClick={() => shift(1)} className="gs-touch rounded-full bg-white text-2xl flex items-center justify-center" style={{ width: 44, height: 44 }}>‹</button>
      </div>

      {/* grid */}
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
              if (alertDates.has(date)) tags.unshift('alert')
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
        {[['milk', 'دودھ'], ['sale', 'فروخت'], ['expense', 'خرچ'], ['breeding', 'افزائش'], ['health', 'صحت'], ['vaccine', 'ٹیکہ'], ['alert', 'یاد دہانی']].map(([k, label]) => (
          <span key={k} className="flex items-center gap-1 font-urdu text-xs text-muted">
            <span className="w-2 h-2 rounded-full" style={{ background: DOT[k] }} /> {label}
          </span>
        ))}
      </div>

      {/* add custom alert */}
      <div className="px-4 mt-4">
        <button onClick={() => setAdding((v) => !v)} className="gs-btn bg-grape text-white w-full">
          🔔 {adding ? 'بند کریں' : 'یاد دہانی شامل کریں'}
        </button>
        {adding && (
          <div className="gs-card p-3 mt-2 space-y-2">
            <div>
              <div className="font-urdu text-sm text-muted mb-1">تاریخ</div>
              <input type="date" value={aDate} onChange={(e) => setADate(e.target.value)} className="gs-input num" />
            </div>
            <div>
              <div className="font-urdu text-sm text-muted mb-1">یاد دہانی لکھیں</div>
              <div className="flex gap-2">
                <input value={aText} onChange={(e) => setAText(e.target.value)} className="gs-input font-urdu flex-1" placeholder="مثلاً گائے نمبر 5 کا ٹیکہ" />
                <button onClick={startVoice} className={`gs-touch rounded-card flex items-center justify-center text-2xl ${listening ? 'bg-danger text-white' : 'bg-cream text-grape'}`} style={{ width: 52, height: 52 }} aria-label="voice">🎤</button>
              </div>
            </div>
            <button onClick={saveAlert} className="gs-btn bg-ok text-white w-full">✅ محفوظ کریں</button>
          </div>
        )}
      </div>

      {/* upcoming alerts */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">🔔 آنے والی یاد دہانیاں</h3>
        {upcoming.length === 0 ? (
          <div className="gs-card p-3 font-urdu text-muted">کوئی یاد دہانی نہیں</div>
        ) : (
          <div className="gs-card divide-y divide-black/5">
            {upcoming.map((a) => {
              const d = daysBetween(today(), a.date)
              return (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-urdu text-base font-bold text-ink break-words leading-snug">{a.text}</div>
                    <div className="font-urdu text-sm text-muted">{shortDate(a.date, lang)} · {d === 0 ? 'آج' : `${d} دن بعد`}</div>
                  </div>
                  <button onClick={() => removeCustomAlert(a.id)} className="gs-touch rounded-full flex items-center justify-center text-danger shrink-0" style={{ width: 40, height: 40 }} aria-label="delete">🗑️</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 mt-4 text-center font-urdu text-sm text-muted">
        👆 کسی بھی دن کو دبائیں — اس دن کا پورا ریکارڈ دیکھیں
      </div>
    </div>
  )
}
