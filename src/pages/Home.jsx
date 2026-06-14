import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useT } from '../i18n/useT.js'
import { rupees, liters, num } from '../lib/format.js'
import { longDate, today } from '../lib/date.js'
import { loadCached, advisories } from '../lib/weather.js'
import * as sel from '../store/selectors.js'
import StatTile from '../components/StatTile.jsx'

const QUICK = [
  { key: 'qa_milk', icon: '🥛', to: '/milk/log', color: 'bg-sky' },
  { key: 'qa_sale', icon: '💰', to: '/buyers/distribute', color: 'bg-gold' },
  { key: 'qa_expense', icon: '🧾', to: '/expenses', color: 'bg-danger' },
  { key: 'qa_newAnimal', icon: '🐄', to: '/animals/new', color: 'bg-primary' },
]

function alertColor(level) {
  return level === 'red' ? 'border-danger' : level === 'yellow' ? 'border-warn' : 'border-sky'
}

export default function Home() {
  const nav = useNavigate()
  const { t, lang, dir } = useT()
  const s = useStore()
  const toggleLang = useStore((st) => st.toggleLang)

  const milkToday = sel.todayMilk(s)
  const income = sel.todayIncome(s)
  const alerts = sel.buildAlerts(s)
  const tasks = alerts.filter((a) => a.level !== 'blue').length
  const wx = loadCached()
  const wxAdvice = wx ? advisories(wx)[0] : null

  return (
    <div className="pb-6">
      {/* weather / date header */}
      <header className="bg-primary text-white px-4 pb-5 rounded-b-3xl shadow-md" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-urdu text-xl">{t('appName')}</div>
            <div className="font-urdu text-sm opacity-80">{t('tagline')}</div>
          </div>
          <button
            onClick={toggleLang}
            className="gs-touch px-3 rounded-full bg-white/15 active:bg-white/25 font-bold text-sm flex items-center justify-center"
            style={{ minHeight: 40 }}
          >
            {lang === 'ur' ? 'English' : 'اردو'}
          </button>
        </div>

        <button
          onClick={() => nav('/weather')}
          className="mt-3 w-full bg-white/10 rounded-card px-3 py-2 active:bg-white/20"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-urdu text-base truncate">
              🌤️ {longDate(today(), lang)}{wx ? ' · ' + wx.place : ''}
            </div>
            <div className="num text-xl font-bold shrink-0">
              {wx ? Math.round(wx.current.temperature_2m) + '°C' : 'موسم'} ›
            </div>
          </div>
          {wxAdvice && <div className="font-urdu text-sm mt-1 opacity-90 break-words text-start leading-snug">{wxAdvice}</div>}
        </button>
      </header>

      {/* 4 summary tiles */}
      <section className="px-4 -mt-3">
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon="🥛" value={liters(milkToday)} label={t('home_todayMilk')} accent="#0277BD" to="/milk" />
          <StatTile icon="💰" value={rupees(income)} label={t('home_todayIncome')} accent="#F9A825" to="/money" />
          <StatTile icon="🐄" value={num(s.animals.length)} label={t('home_totalAnimals')} accent="#1B5E20" to="/animals" />
          <StatTile icon="⚠️" value={num(tasks)} label={t('home_todayTasks')} accent="#E65100" to="/calendar" />
        </div>
      </section>

      {/* alerts */}
      <section className="px-4 mt-5">
        <h2 className="font-urdu text-xl font-bold text-ink mb-2">⚠️ {t('home_alerts')}</h2>
        {alerts.length === 0 ? (
          <div className="gs-card p-4 font-urdu text-muted text-lg">{t('home_noAlerts')}</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {alerts.map((a) => (
              <div
                key={a.id}
                onClick={() => a.to && nav(a.to)}
                className={`gs-card border-s-[6px] ${alertColor(a.level)} p-3 min-w-[78%] active:scale-[0.99] transition`}
              >
                <div className="font-urdu text-lg leading-snug text-ink">
                  {a.icon} {a.text}
                </div>
                {a.amount != null && (
                  <div className="num text-2xl font-bold text-danger mt-1">{rupees(a.amount)}</div>
                )}
                {a.action?.type === 'call' && (
                  <a
                    href={`tel:${a.action.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="gs-btn bg-ok text-white mt-2 text-base"
                    style={{ minHeight: 44 }}
                  >
                    📞 {t('call')} — {a.action.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* quick log */}
      <section className="px-4 mt-5">
        <h2 className="font-urdu text-xl font-bold text-ink mb-2">⚡ {t('home_quickLog')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map((q) => (
            <button
              key={q.key}
              onClick={() => nav(q.to)}
              className={`gs-btn ${q.color} text-white`}
            >
              <span style={{ fontSize: 24 }}>{q.icon}</span>
              <span className="font-urdu">{t(q.key)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* everything else lives under the ⚙️ مزید tab in the bottom bar */}
      <section className="px-4 mt-5">
        <button onClick={() => nav('/animals')} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <span className="font-urdu text-lg font-bold">🐄 سارے جانور دیکھیں</span>
          <span className="text-2xl text-muted">›</span>
        </button>
      </section>
    </div>
  )
}
