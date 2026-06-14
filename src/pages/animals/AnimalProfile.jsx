import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { liters, num } from '../../lib/format.js'
import { today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import { speciesLabel } from '../../lib/domain.js'
import { STATUS, ageText } from './statusBadge.js'

export default function AnimalProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const softDelete = useStore((st) => st.softDelete)
  const show = useToast((st) => st.show)
  const a = s.animals.find((x) => x.id === id)

  function onDelete() {
    softDelete('animals', id)
    show(lang === 'ur' ? 'ردی کی ٹوکری میں چلا گیا 🗑️' : 'Moved to recycle bin 🗑️', true)
    nav('/animals')
  }

  if (!a) {
    return (
      <div>
        <PageHeader title="—" />
        <p className="font-urdu text-lg text-muted text-center mt-10">جانور نہیں ملا</p>
      </div>
    )
  }

  const st = STATUS[a.status] || STATUS.active
  const stats = sel.isMilker(a) ? sel.animalStats(s, id) : null

  const rows = [
    [t('animals_tag'), a.tag, true],
    ['قسم', a.speciesName || speciesLabel(a.species, lang), false],
    [t('animals_breed'), a.breed || '—', false],
    [t('animals_sex'), a.sex === 'f' ? t('animals_female') : t('animals_male'), false],
    [t('animals_age'), ageText(a.dob, t), false],
    [t('animals_weight'), a.weight ? `${num(a.weight)} kg` : '—', true],
  ]

  return (
    <div className="pb-8">
      <PageHeader
        title={a.name || `نمبر ${a.tag}`}
        color="bg-primary"
        action={
          <button
            onClick={() => nav(`/animals/${a.id}/edit`)}
            className="gs-touch bg-white/20 rounded-full font-urdu text-base px-3 flex items-center justify-center"
            style={{ minHeight: 44 }}
          >
            {t('edit')}
          </button>
        }
      />

      {/* hero */}
      <div className="px-4 mt-4">
        <div className="gs-card p-5 flex flex-col items-center">
          <AnimalAvatar animal={a} size={104} />
          <div className="font-urdu text-2xl font-bold mt-3">{a.name || `نمبر ${a.tag}`}</div>
          <span className={`mt-1 px-3 py-1 rounded-full font-urdu text-base ${st.cls}`}>
            {st.emoji} {t(st.key)}
          </span>
        </div>
      </div>

      {/* details */}
      <div className="px-4 mt-3">
        <div className="gs-card divide-y divide-black/5">
          {rows.map(([label, value, mono]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="font-urdu text-lg text-muted">{label}</span>
              <span className={`${mono ? 'num' : 'font-urdu'} text-lg font-bold text-ink`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* milk snapshot */}
      {stats && (
        <div className="px-4 mt-3">
          <button
            onClick={() => nav(`/milk/animal/${a.id}`)}
            className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99] transition"
          >
            <div className="text-start">
              <div className="font-urdu text-lg font-bold text-sky">🥛 {t('milk_perAnimal')}</div>
              <div className="font-urdu text-sm text-muted mt-1">
                {t('today')}: <span className="num">{liters(sel.animalDayMilk(s, a.id, today()))}</span> · {t('milk_monthTotal')}: <span className="num">{liters(stats.monthTotal)}</span>
              </div>
            </div>
            <span className="text-2xl text-sky">›</span>
          </button>
        </div>
      )}

      {/* family tree */}
      <div className="px-4 mt-3">
        <h3 className="font-urdu text-lg font-bold mb-2">🌳 شجرہ نسب</h3>
        <div className="gs-card p-4">
          <FamilyTree a={a} s={s} nav={nav} />
        </div>
      </div>

      {/* edit / delete */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => nav(`/animals/${a.id}/edit`)} className="gs-btn bg-white text-primary border-2 border-primary/20">✏️ {t('edit')}</button>
        <button onClick={onDelete} className="gs-btn bg-white text-danger border-2 border-danger/30">🗑️ {lang === 'ur' ? 'حذف کریں' : 'Delete'}</button>
      </div>
    </div>
  )
}

function TreeBox({ animal, nav, label, self }) {
  if (!animal) {
    return (
      <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
        <div className="rounded-full bg-black/10 flex items-center justify-center" style={{ width: 52, height: 52 }}>
          <span style={{ fontSize: 22 }} className="opacity-60">❔</span>
        </div>
        <span className="font-urdu text-xs text-muted">نامعلوم</span>
        {label && <span className="font-urdu text-[11px] text-muted">{label}</span>}
      </div>
    )
  }
  return (
    <button onClick={() => nav(`/animals/${animal.id}`)} className="flex flex-col items-center gap-1 active:scale-95" style={{ width: 80 }}>
      <div className={self ? 'rounded-full ring-2 ring-primary' : ''}>
        <AnimalAvatar animal={animal} size={52} showTag={false} />
      </div>
      <span className="font-urdu text-xs font-bold text-ink truncate w-full text-center">{animal.name || 'نمبر ' + animal.tag}</span>
      {label && <span className="font-urdu text-[11px] text-muted">{label}</span>}
    </button>
  )
}

function FamilyTree({ a, s, nav }) {
  const mother = a.motherId ? sel.findAnimal(s, a.motherId) : null
  const father = a.fatherId ? sel.findAnimal(s, a.fatherId) : null
  const children = s.animals.filter((x) => x.motherId === a.id || x.fatherId === a.id)
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 justify-center">
        <TreeBox animal={father} nav={nav} label="باپ" />
        <TreeBox animal={mother} nav={nav} label="ماں" />
      </div>
      <div className="text-2xl text-muted leading-none my-1">↓</div>
      <TreeBox animal={a} nav={nav} label="یہ جانور" self />
      {children.length > 0 ? (
        <>
          <div className="text-2xl text-muted leading-none my-1">↓</div>
          <div className="flex gap-4 flex-wrap justify-center">
            {children.map((c) => <TreeBox key={c.id} animal={c} nav={nav} label="بچہ" />)}
          </div>
        </>
      ) : (
        <div className="font-urdu text-sm text-muted mt-2">ابھی کوئی بچہ نہیں</div>
      )}
    </div>
  )
}
