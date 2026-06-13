import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell,
} from 'recharts'
import { useStore } from '../../store/useStore.js'
import { useT } from '../../i18n/useT.js'
import { liters, lnum } from '../../lib/format.js'
import { weekdayShort, shortDate } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function AnimalMilk() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const animal = s.animals.find((a) => a.id === id)
  if (!animal) return <Missing nav={nav} t={t} />

  const stats = sel.animalStats(s, id)
  const s7 = sel.animalSeries(s, id, 7).map((d) => ({ ...d, day: weekdayShort(d.date, lang) }))
  const s30 = sel.animalSeries(s, id, 30).map((d, i) => ({ ...d, i }))
  const max7 = Math.max(...s7.map((d) => d.liters), 1)
  const peakL = stats.peak.liters

  const trend = stats.trendPct
  const arrow = trend > 3 ? '↑' : trend < -3 ? '↓' : '→'
  const arrowColor = trend > 3 ? 'text-ok' : trend < -3 ? 'text-danger' : 'text-muted'

  return (
    <div className="pb-8">
      <PageHeader title={animal.name || `نمبر ${animal.tag}`} color="bg-sky" />

      {/* header card */}
      <div className="px-4 mt-4">
        <div className="gs-card p-4 flex items-center gap-4">
          <AnimalAvatar animal={animal} size={64} />
          <div className="flex-1">
            <div className="font-urdu text-xl font-bold">{animal.name || `نمبر ${animal.tag}`}</div>
            <div className="font-urdu text-base text-muted">{animal.breed}</div>
          </div>
          <div className="text-end">
            <div className="num text-4xl font-bold text-sky">{liters(stats.todayL)}</div>
            <div className="font-urdu text-sm text-muted">{t('today')}</div>
          </div>
        </div>
      </div>

      {/* stat row */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        <Stat label={t('milk_monthTotal')} value={liters(stats.monthTotal)} />
        <Stat label={t('milk_avg')} value={lnum(stats.avg) + 'L'} />
        <Stat label={t('milk_peak')} value={liters(peakL)} />
      </div>
      <div className="px-4 mt-2">
        <div className="gs-card p-2 flex items-center justify-center gap-2">
          <span className={`text-2xl font-bold ${arrowColor}`}>{arrow}</span>
          <span className="font-urdu text-base text-muted">
            پچھلے مہینے کے مقابلے میں <span className={`num font-bold ${arrowColor}`}>{Math.abs(Math.round(trend))}%</span>
          </span>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📊 {t('milk_7day')}</h3>
        <div className="gs-card p-2" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s7} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 13, fontFamily: 'Noto Nastaliq Urdu' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip formatter={(v) => liters(v)} labelFormatter={() => ''} />
              <Bar dataKey="liters" radius={[6, 6, 0, 0]}>
                {s7.map((d, i) => (
                  <Cell key={i} fill={d.liters >= max7 ? '#1B5E20' : '#0277BD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-day line chart with average */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📈 {t('milk_30day')}</h3>
        <div className="gs-card p-2" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={s30} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="i" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip formatter={(v) => liters(v)} labelFormatter={() => ''} />
              <ReferenceLine y={stats.avg} stroke="#F9A825" strokeDasharray="5 4" strokeWidth={2} />
              <Line type="monotone" dataKey="liters" stroke="#0277BD" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="font-urdu text-sm text-muted mt-1 text-center">
          🟡 پیلی لکیر = اوسط <span className="num">{lnum(stats.avg)}L</span>
        </div>
      </div>

      {/* recent editable records */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📋 حالیہ ریکارڈ</h3>
        <div className="gs-card divide-y divide-black/5">
          {s.milkLogs
            .filter((m) => m.animalId === id)
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 12)
            .map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-2">
                <span className="font-urdu text-sm text-muted shrink-0 w-16">{shortDate(m.date, lang)}</span>
                <span className="num text-sm flex-1 text-center text-muted">صبح {lnum(m.morning)} · شام {lnum(m.evening)}</span>
                <span className="num text-base font-bold text-sky shrink-0">{liters((m.morning || 0) + (m.evening || 0))}</span>
                <EditBtn collection="milkLogs" id={m.id} />
              </div>
            ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <Link to={`/animals/${animal.id}`} className="gs-btn bg-white text-primary border-2 border-primary/20">
          🐄 جانور کی تفصیل دیکھیں
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="gs-card p-2 text-center">
      <div className="num text-xl font-bold text-ink">{value}</div>
      <div className="font-urdu text-xs text-muted leading-tight mt-0.5">{label}</div>
    </div>
  )
}

function Missing({ nav, t }) {
  return (
    <div className="p-6 text-center">
      <PageHeader title="—" color="bg-sky" />
      <p className="font-urdu text-lg text-muted mt-8">جانور نہیں ملا</p>
      <button onClick={() => nav('/milk')} className="gs-btn bg-sky text-white mt-4">{t('back')}</button>
    </div>
  )
}
