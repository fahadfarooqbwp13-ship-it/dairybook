import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useT } from '../i18n/useT.js'

// 5 primary destinations; the 5th ("مزید") opens a grid sheet with the rest.
const ITEMS = [
  { to: '/', icon: '🏠', label: { ur: 'ہوم', en: 'Home' }, end: true },
  { to: '/animals', icon: '🐄', label: { ur: 'جانور', en: 'Animals' } },
  { to: '/milk', icon: '🥛', label: { ur: 'دودھ', en: 'Milk' } },
  { to: '/buyers', icon: '💰', label: { ur: 'مالیہ', en: 'Money' } },
]

const MORE = [
  { to: '/expenses', icon: '🧾', label: { ur: 'اخراجات', en: 'Expenses' } },
  { to: '/reports', icon: '📊', label: { ur: 'رپورٹ', en: 'Reports' } },
  { to: '/health', icon: '💊', label: { ur: 'صحت', en: 'Health' } },
  { to: '/breeding', icon: '🍼', label: { ur: 'افزائش', en: 'Breeding' } },
  { to: '/calendar', icon: '📅', label: { ur: 'کیلنڈر', en: 'Calendar' } },
  { to: '/weather', icon: '🌤️', label: { ur: 'موسم', en: 'Weather' } },
  { to: '/trade', icon: '🛒', label: { ur: 'خرید فروخت', en: 'Buy/Sell' } },
  { to: '/more', icon: '⚙️', label: { ur: 'ترتیبات', en: 'Settings' } },
]

export default function BottomNav() {
  const { lang } = useT()
  const nav = useNavigate()
  const [sheet, setSheet] = useState(false)

  return (
    <>
      {sheet && (
        <div className="absolute inset-0 z-40 bg-black/50 flex items-end" onClick={() => setSheet(false)}>
          <div className="bg-surface rounded-t-3xl w-full p-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-urdu text-xl font-bold">مزید</div>
              <button onClick={() => setSheet(false)} className="gs-touch text-3xl text-muted flex items-center justify-center" style={{ width: 40, height: 40 }}>×</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MORE.map((m) => (
                <button
                  key={m.to}
                  onClick={() => { setSheet(false); nav(m.to) }}
                  className="gs-card p-3 flex flex-col items-center gap-2 active:scale-95"
                >
                  <span style={{ fontSize: 30 }}>{m.icon}</span>
                  <span className="font-urdu text-base text-ink leading-tight text-center">{m.label[lang]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="shrink-0 bg-surface border-t border-black/5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]" style={{ minHeight: 65 }}>
        <div className="grid grid-cols-5 h-full">
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setSheet(false)}
              className="flex flex-col items-center justify-center gap-1 py-1.5"
            >
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: isActive ? 30 : 26 }} className={isActive ? '' : 'opacity-60'}>{it.icon}</span>
                  <span className={`font-urdu text-sm leading-none whitespace-nowrap ${isActive ? 'text-primary font-bold' : 'text-muted'}`}>{it.label[lang]}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* مزید */}
          <button onClick={() => setSheet((v) => !v)} className="flex flex-col items-center justify-center gap-1 py-1.5">
            <span style={{ fontSize: sheet ? 30 : 26 }} className={sheet ? '' : 'opacity-60'}>⚙️</span>
            <span className={`font-urdu text-sm leading-none whitespace-nowrap ${sheet ? 'text-primary font-bold' : 'text-muted'}`}>مزید</span>
          </button>
        </div>
      </nav>
    </>
  )
}
