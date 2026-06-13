import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/useT.js'

const ITEMS = [
  { to: '/', key: 'nav_home', icon: '🏠', end: true },
  { to: '/milk', key: 'nav_milk', icon: '🥛' },
  { to: '/animals', key: 'nav_animals', icon: '🐄' },
  { to: '/buyers', key: 'nav_buyers', icon: '💰' },
  { to: '/more', key: 'nav_more', icon: '☰' },
]

export default function BottomNav() {
  const { t } = useT()
  return (
    <nav className="shrink-0 bg-surface border-t border-black/5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `gs-touch flex flex-col items-center justify-center gap-0.5 py-1.5
               ${isActive ? 'text-primary' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 26 }} className={isActive ? '' : 'opacity-70'}>
                  {it.icon}
                </span>
                <span className="font-urdu text-sm leading-none">{t(it.key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
