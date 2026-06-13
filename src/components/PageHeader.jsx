import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n/useT.js'

// Sub-page top bar: back chevron (direction-aware) + title + optional action.
export default function PageHeader({ title, color = 'bg-primary', action }) {
  const nav = useNavigate()
  const { lang } = useT()
  // in RTL "back" points right; in LTR it points left
  const chevron = lang === 'ur' ? '›' : '‹'
  return (
    <header className={`${color} text-white sticky top-0 z-20 shadow`}>
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => nav(-1)}
          className="gs-touch flex items-center justify-center rounded-full active:bg-white/20"
          aria-label="back"
          style={{ width: 44, height: 44 }}
        >
          <span className="text-3xl leading-none">{chevron}</span>
        </button>
        <h1 className="font-urdu text-2xl font-bold flex-1 truncate">{title}</h1>
        {action}
      </div>
    </header>
  )
}
