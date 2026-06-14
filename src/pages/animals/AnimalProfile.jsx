import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { liters, num, rupees } from '../../lib/format.js'
import { today, shortDate } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import { speciesLabel, vaccineLabel, symptomLabel } from '../../lib/domain.js'
import { STATUS, ageText } from './statusBadge.js'

const BREED_LABEL = { heat: 'گرمی', mating: 'ملاپ', pregnancy: 'حمل', calving: 'پیدائش' }

export default function AnimalProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const s = useStore()
  const softDelete = useStore((st) => st.softDelete)
  const updateAnimal = useStore((st) => st.updateAnimal)
  const show = useToast((st) => st.show)
  const a = s.animals.find((x) => x.id === id)
  const [picking, setPicking] = useState(null) // 'mother' | 'father' | 'child'

  function onDelete() {
    softDelete('animals', id)
    show(lang === 'ur' ? 'ردی کی ٹوکری میں چلا گیا 🗑️' : 'Moved to recycle bin 🗑️', true)
    nav('/animals')
  }

  function applyPick(pickedId) {
    if (picking === 'mother') updateAnimal(a.id, { motherId: pickedId })
    else if (picking === 'father') updateAnimal(a.id, { fatherId: pickedId })
    else if (picking === 'child') updateAnimal(pickedId, a.sex === 'm' ? { fatherId: a.id } : { motherId: a.id })
    setPicking(null)
    show('شجرہ اپ ڈیٹ ہو گیا ✅', true)
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

      {/* full record */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-2">📋 مکمل ریکارڈ</h3>
        <div className="space-y-3">
          {(() => {
            const breeding = sel.animalBreeding(s, id)
            const meds = s.medicineLogs.filter((m) => m.animalId === id).slice().sort((x, y) => (x.date < y.date ? 1 : -1))
            const health = sel.animalHealth(s, id)
            const vacc = sel.animalVaccinations(s, id)
            const txns = s.transactions.filter((tx) => tx.animalId === id).slice().sort((x, y) => (x.date < y.date ? 1 : -1))
            const none = !breeding.length && !meds.length && !health.length && !vacc.length && !txns.length
            return (
              <>
                {breeding.length > 0 && <RecCard title="🍼 افزائش نسل" rows={breeding.map((b) => [BREED_LABEL[b.type] || b.type, shortDate(b.date, lang)])} />}
                {meds.length > 0 && <RecCard title="💊 دی گئی دوائیں" rows={meds.map((m) => [m.name + (m.dose ? ` · ${m.dose}` : ''), shortDate(m.date, lang)])} />}
                {health.length > 0 && <RecCard title="🤒 بیماری / علاج" rows={health.map((h) => [h.diagnosis || (h.symptoms || []).map(symptomLabel).join('، ') || 'بیماری', shortDate(h.date, lang)])} />}
                {vacc.length > 0 && <RecCard title="💉 ٹیکے" rows={vacc.map((v) => [vaccineLabel(v.vaccine, lang), v.nextDue ? `اگلا: ${shortDate(v.nextDue, lang)}` : shortDate(v.givenDate, lang)])} />}
                {txns.length > 0 && <RecCard title="🛒 خرید و فروخت" rows={txns.map((t) => [t.type === 'buy' ? 'خریدا' : 'فروخت', rupees(t.price)])} />}
                {none && <div className="gs-card p-3 font-urdu text-muted text-center">ابھی اس جانور کا کوئی اضافی ریکارڈ نہیں</div>}
              </>
            )
          })()}
        </div>
      </div>

      {/* family tree */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-2">🌳 شجرہ نسب</h3>
        <div className="gs-card p-4">
          <FamilyTree a={a} s={s} nav={nav} onPick={setPicking} />
        </div>
      </div>

      {/* edit / delete */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => nav(`/animals/${a.id}/edit`)} className="gs-btn bg-white text-primary border-2 border-primary/20">✏️ {t('edit')}</button>
        <button onClick={onDelete} className="gs-btn bg-white text-danger border-2 border-danger/30">🗑️ {lang === 'ur' ? 'حذف کریں' : 'Delete'}</button>
      </div>

      {/* family member picker */}
      {picking && (
        <PickerSheet
          title={picking === 'mother' ? 'ماں منتخب کریں' : picking === 'father' ? 'باپ منتخب کریں' : 'بچہ منتخب کریں'}
          candidates={
            picking === 'mother'
              ? s.animals.filter((x) => x.sex === 'f' && x.id !== a.id)
              : picking === 'father'
                ? s.animals.filter((x) => x.sex === 'm' && x.id !== a.id)
                : s.animals.filter((x) => x.id !== a.id && x.id !== a.motherId && x.id !== a.fatherId)
          }
          onPick={applyPick}
          onClose={() => setPicking(null)}
          addNew={picking === 'child' ? () => { setPicking(null); nav('/animals/new') } : null}
        />
      )}
    </div>
  )
}

function PickerSheet({ title, candidates, onPick, onClose, addNew }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl w-full max-h-[80%] overflow-y-auto p-4" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-urdu text-xl font-bold">{title}</div>
          <button onClick={onClose} className="gs-touch text-3xl text-muted flex items-center justify-center" style={{ width: 40, height: 40 }}>×</button>
        </div>
        {candidates.length === 0 ? (
          <div className="font-urdu text-muted py-4 text-center">کوئی جانور دستیاب نہیں</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {candidates.map((c) => (
              <button key={c.id} onClick={() => onPick(c.id)} className="gs-card p-2 flex flex-col items-center gap-1 active:scale-95">
                <AnimalAvatar animal={c} size={52} />
                <span className="font-urdu text-sm font-bold truncate w-full text-center">{c.name || 'نمبر ' + c.tag}</span>
              </button>
            ))}
          </div>
        )}
        {addNew && (
          <button onClick={addNew} className="gs-btn bg-primary text-white w-full mt-3">➕ نیا بچہ شامل کریں</button>
        )}
      </div>
    </div>
  )
}

function TreeBox({ animal, nav, label, self, onAdd }) {
  if (!animal) {
    return (
      <button type="button" onClick={onAdd} className="flex flex-col items-center gap-1 active:scale-95" style={{ width: 80 }}>
        <div className="rounded-full bg-primary/5 border-2 border-dashed border-primary/40 flex items-center justify-center" style={{ width: 52, height: 52 }}>
          <span style={{ fontSize: 24 }} className="text-primary">＋</span>
        </div>
        <span className="font-urdu text-xs text-primary font-bold">{label} چنیں</span>
      </button>
    )
  }
  return (
    <button onClick={() => nav(`/animals/${animal.id}`)} className="flex flex-col items-center gap-1 active:scale-95" style={{ width: 80 }}>
      <div className={self ? 'rounded-full ring-2 ring-primary' : ''}>
        <AnimalAvatar animal={animal} size={52} showTag={false} />
      </div>
      <span className="font-urdu text-xs font-bold text-ink truncate w-full text-center">{animal.name || 'نمبر ' + animal.tag}</span>
      {label && <span className="font-urdu text-xs text-muted">{label}</span>}
    </button>
  )
}

function FamilyTree({ a, s, nav, onPick }) {
  const mother = a.motherId ? sel.findAnimal(s, a.motherId) : null
  const father = a.fatherId ? sel.findAnimal(s, a.fatherId) : null
  const children = s.animals.filter((x) => x.motherId === a.id || x.fatherId === a.id)
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 justify-center">
        <TreeBox animal={father} nav={nav} label="باپ" onAdd={() => onPick('father')} />
        <TreeBox animal={mother} nav={nav} label="ماں" onAdd={() => onPick('mother')} />
      </div>
      <div className="text-2xl text-muted leading-none my-1">↓</div>
      <TreeBox animal={a} nav={nav} label="یہ جانور" self />
      <div className="text-2xl text-muted leading-none my-1">↓</div>
      {children.length > 0 && (
        <div className="flex gap-4 flex-wrap justify-center mb-3">
          {children.map((c) => <TreeBox key={c.id} animal={c} nav={nav} label="بچہ" />)}
        </div>
      )}
      <button onClick={() => onPick('child')} className="gs-btn bg-white text-primary border-2 border-primary/20 text-base px-4" style={{ minHeight: 44 }}>➕ بچہ جوڑیں</button>
    </div>
  )
}

function RecCard({ title, rows }) {
  return (
    <div className="gs-card overflow-hidden">
      <div className="bg-cream px-3 py-2 font-urdu text-base font-bold">{title}</div>
      <div className="divide-y divide-black/5">
        {rows.map(([left, right], i) => (
          <div key={i} className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="font-urdu text-base text-ink flex-1 min-w-0 truncate">{left}</span>
            <span className="num text-sm text-muted shrink-0">{right}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
