import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useT } from '../../i18n/useT.js'
import { liters } from '../../lib/format.js'
import { today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import { STATUS } from './statusBadge.js'

const FILTERS = [
  { key: 'all', label: { ur: 'سب', en: 'All' } },
  { key: 'cow', label: { ur: '🐄 گائے', en: '🐄 Cows' } },
  { key: 'buffalo', label: { ur: '🐃 بھینس', en: '🐃 Buffalo' } },
  { key: 'f', label: { ur: 'مادہ', en: 'Female' } },
  { key: 'm', label: { ur: 'نر', en: 'Male' } },
]

export default function AnimalList() {
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const [filter, setFilter] = useState('all')

  const females = s.animals.filter((a) => a.sex === 'f').length
  const males = s.animals.length - females
  const pregnant = s.animals.filter((a) => a.status === 'pregnant').length

  const list = s.animals.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'cow' || filter === 'buffalo') return a.species === filter
    return a.sex === filter
  })

  return (
    <div className="pb-6">
      <PageHeader
        title={t('animals_title')}
        color="bg-primary"
        action={
          <button
            onClick={() => nav('/animals/new')}
            className="gs-touch bg-white/20 rounded-full font-bold text-2xl flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            aria-label="add"
          >
            +
          </button>
        }
      />

      {/* quick stats bar */}
      <div className="px-4 mt-3">
        <div className="gs-card p-3 grid grid-cols-4 text-center divide-x divide-black/5 [&>*]:px-1">
          <Stat n={s.animals.length} label={t('animals_count')} />
          <Stat n={females} label={t('animals_female')} />
          <Stat n={males} label={t('animals_male')} />
          <Stat n={pregnant} label={t('animals_pregnant')} />
        </div>
      </div>

      {/* filter chips */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 rounded-full font-urdu text-base whitespace-nowrap ${
              filter === f.key ? 'bg-primary text-white' : 'bg-white text-muted'
            }`}
            style={{ minHeight: 44 }}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>

      {/* photo grid */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {list.map((a) => {
          const st = STATUS[a.status] || STATUS.active
          const todayMilk = sel.animalDayMilk(s, a.id, today())
          return (
            <button
              key={a.id}
              onClick={() => nav(`/animals/${a.id}`)}
              className="gs-card p-3 flex flex-col items-center text-center active:scale-[0.98] transition"
            >
              <AnimalAvatar animal={a} size={64} />
              <div className="font-urdu text-lg font-bold mt-2 text-ink truncate w-full">
                {a.name || `نمبر ${a.tag}`}
              </div>
              <div className="font-urdu text-sm text-muted">{a.breed}</div>
              <span className={`mt-1 px-2 py-0.5 rounded-full font-urdu text-sm ${st.cls}`}>
                {st.emoji} {t(st.key)}
              </span>
              {sel.isMilker(a) && (
                <div className="num text-base text-sky mt-1">{liters(todayMilk)} {t('today')}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="num text-2xl font-bold text-primary">{n}</div>
      <div className="font-urdu text-xs text-muted leading-tight">{label}</div>
    </div>
  )
}
