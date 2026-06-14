import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { shortDate, today, addDays } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { animalName, findAnimal } from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import EditBtn from '../../components/EditBtn.jsx'

const HEAT_CYCLE = 21 // days to next heat
const GESTATION = 280 // days to expected birth

export default function Breeding() {
  const { t, lang } = useT()
  const s = useStore()
  const addBreedingEvent = useStore((st) => st.addBreedingEvent)
  const recordCalving = useStore((st) => st.recordCalving)
  const updateAnimal = useStore((st) => st.updateAnimal)
  const show = useToast((st) => st.show)

  const females = s.animals.filter((a) => a.sex === 'f' && a.status !== 'sold' && a.status !== 'dead')
  const [tab, setTab] = useState('heat')
  const upcoming = sel.upcomingCalvings(s)

  const TABS = [
    ['heat', '🔴 گرمی'],
    ['mating', '💕 ملاپ'],
    ['birth', '🍼 پیدائش'],
  ]

  return (
    <div className="pb-8">
      <PageHeader title="افزائش نسل" color="bg-rose" />

      {/* step tabs */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-card font-urdu text-lg ${tab === k ? 'bg-rose text-white' : 'bg-white text-muted'}`}
            style={{ minHeight: 52 }}
          >
            {label}
          </button>
        ))}
      </div>

      {females.length === 0 ? (
        <div className="px-4 mt-8 text-center font-urdu text-lg text-muted">پہلے مادہ جانور شامل کریں</div>
      ) : (
        <div className="px-4 mt-3">
          {tab === 'heat' && <HeatForm females={females} add={addBreedingEvent} show={show} lang={lang} />}
          {tab === 'mating' && <MatingForm females={females} add={addBreedingEvent} updateAnimal={updateAnimal} show={show} lang={lang} />}
          {tab === 'birth' && <BirthForm females={females} recordCalving={recordCalving} add={addBreedingEvent} updateAnimal={updateAnimal} show={show} lang={lang} />}
        </div>
      )}

      {/* upcoming calvings */}
      <div className="px-4 mt-5">
        <h3 className="font-urdu text-lg font-bold mb-1">🍼 آنے والے بچے</h3>
        {upcoming.length === 0 ? (
          <div className="gs-card p-3 font-urdu text-muted">کوئی متوقع بچہ نہیں</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((u) => (
              <div key={u.id} className="gs-card p-3 flex items-center gap-3">
                <AnimalAvatar animal={u.animal} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="font-urdu text-base font-bold truncate">{animalName(u.animal)}</div>
                  <div className="font-urdu text-sm text-muted">متوقع بچہ: {shortDate(u.expectedCalving, lang)}</div>
                </div>
                <span className="num text-base font-bold text-rose shrink-0">{u.daysLeft > 0 ? `${u.daysLeft} دن` : 'جلد'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* recent events (editable) */}
      <div className="px-4 mt-5">
        <h3 className="font-urdu text-lg font-bold mb-1">📋 حالیہ ریکارڈ</h3>
        <div className="gs-card divide-y divide-black/5">
          {s.breedingEvents.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12).map((b) => {
            const icon = { heat: '🔴', mating: '💕', pregnancy: '🟣', calving: '🍼' }[b.type] || '•'
            const label = { heat: 'گرمی', mating: 'ملاپ', pregnancy: 'حمل', calving: 'پیدائش' }[b.type] || b.type
            return (
              <div key={b.id} className="flex items-center gap-2 px-3 py-2">
                <span style={{ fontSize: 18 }} className="shrink-0">{icon}</span>
                <span className="font-urdu text-base flex-1 min-w-0 truncate">{animalName(findAnimal(s, b.animalId))} — {label}</span>
                <span className="font-urdu text-sm text-muted shrink-0">{shortDate(b.date, lang)}</span>
                <EditBtn collection="breedingEvents" id={b.id} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AnimalSelect({ females, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="gs-input font-urdu">
      {females.map((a) => (
        <option key={a.id} value={a.id}>{a.tag} — {a.name || 'بے نام'} ({a.breed || '—'})</option>
      ))}
    </select>
  )
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="font-urdu text-base text-muted block mb-1">{label}</span>
      {children}
    </label>
  )
}

function Result({ text }) {
  if (!text) return null
  return <div className="gs-card p-3 mt-1 mb-3 font-urdu text-lg text-center border-2 border-rose/30 text-rose">{text}</div>
}

// ---- Step 1: Heat ----
function HeatForm({ females, add, show, lang }) {
  const [animalId, setAnimalId] = useState(females[0]?.id)
  const [date, setDate] = useState(today())
  const [result, setResult] = useState('')

  function save() {
    if (!animalId) return
    add({ animalId, type: 'heat', date })
    const next = addDays(date, HEAT_CYCLE)
    setResult(`اگلی گرمی متوقع: ${shortDate(next, lang)}`)
    show(lang === 'ur' ? 'گرمی ریکارڈ ہو گئی ✅' : 'Heat recorded ✅', true)
  }

  return (
    <div className="gs-card p-4">
      <div className="font-urdu text-xl font-bold text-rose mb-3">🔴 گرمی ریکارڈ کریں</div>
      <Field label="کون سا جانور؟"><AnimalSelect females={females} value={animalId} onChange={setAnimalId} /></Field>
      <Field label="گرمی کی تاریخ"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gs-input num" /></Field>
      <Result text={result} />
      <button onClick={save} className="gs-btn bg-ok text-white w-full text-xl">✅ محفوظ کریں</button>
    </div>
  )
}

// ---- Step 2: Mating ----
function MatingForm({ females, add, updateAnimal, show, lang }) {
  const [animalId, setAnimalId] = useState(females[0]?.id)
  const [date, setDate] = useState(today())
  const [method, setMethod] = useState('ai')
  const [bull, setBull] = useState('')
  const [result, setResult] = useState('')

  function save() {
    if (!animalId) return
    const expectedCalving = addDays(date, GESTATION)
    add({
      animalId, type: 'mating', date,
      method, aiDetails: method === 'ai' ? (bull.trim() ? `سانڈ: ${bull.trim()}` : 'مصنوعی نسل') : 'قدرتی',
      expectedCalving,
    })
    updateAnimal(animalId, { status: 'pregnant' })
    setResult(`متوقع بچہ: ${shortDate(expectedCalving, lang)} (${GESTATION} دن)`)
    show(lang === 'ur' ? 'ملاپ ریکارڈ ہو گیا ✅' : 'Mating recorded ✅', true)
  }

  return (
    <div className="gs-card p-4">
      <div className="font-urdu text-xl font-bold text-rose mb-3">💕 ملاپ ریکارڈ کریں</div>
      <Field label="کون سا جانور؟"><AnimalSelect females={females} value={animalId} onChange={setAnimalId} /></Field>
      <Field label="ملاپ کی تاریخ"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gs-input num" /></Field>
      <Field label="طریقہ">
        <div className="grid grid-cols-2 gap-2">
          {[['ai', 'مصنوعی نسل'], ['natural', 'قدرتی']].map(([k, label]) => (
            <button key={k} onClick={() => setMethod(k)} className={`rounded-card font-urdu text-lg border-2 ${method === k ? 'border-rose bg-rose/10' : 'border-black/10 bg-white text-muted'}`} style={{ minHeight: 52 }}>{label}</button>
          ))}
        </div>
      </Field>
      {method === 'ai' && (
        <Field label="سانڈ کا نام (اختیاری)"><input value={bull} onChange={(e) => setBull(e.target.value)} className="gs-input font-urdu" placeholder="مثلاً نیلی راوی سانڈ" /></Field>
      )}
      <Result text={result} />
      <button onClick={save} className="gs-btn bg-ok text-white w-full text-xl">✅ محفوظ کریں</button>
    </div>
  )
}

// ---- Step 3: Birth ----
function BirthForm({ females, recordCalving, add, updateAnimal, show, lang }) {
  const [motherId, setMotherId] = useState(females[0]?.id)
  const [date, setDate] = useState(today())
  const [alive, setAlive] = useState(true)
  const [sex, setSex] = useState('f')
  const [weight, setWeight] = useState('')

  function save() {
    if (!motherId) return
    if (alive) {
      recordCalving(motherId, { date, sex, weight: +weight || 0, outcome: 'live' })
      show(lang === 'ur' ? 'بچہ مبارک ہو! 🍼' : 'Calf born! 🍼', true)
    } else {
      add({ animalId: motherId, type: 'calving', date, outcome: 'stillborn' })
      updateAnimal(motherId, { status: 'active' })
      show(lang === 'ur' ? 'ریکارڈ محفوظ ہو گیا' : 'Recorded', true)
    }
    setWeight('')
  }

  return (
    <div className="gs-card p-4">
      <div className="font-urdu text-xl font-bold text-rose mb-3">🍼 پیدائش ریکارڈ کریں</div>
      <Field label="ماں (کون سا جانور؟)"><AnimalSelect females={females} value={motherId} onChange={setMotherId} /></Field>
      <Field label="پیدائش کی تاریخ"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gs-input num" /></Field>
      <Field label="بچہ زندہ ہے؟">
        <div className="grid grid-cols-2 gap-2">
          {[[true, '✅ ہاں'], [false, '❌ نہیں']].map(([v, label]) => (
            <button key={String(v)} onClick={() => setAlive(v)} className={`rounded-card font-urdu text-lg border-2 ${alive === v ? 'border-rose bg-rose/10' : 'border-black/10 bg-white text-muted'}`} style={{ minHeight: 52 }}>{label}</button>
          ))}
        </div>
      </Field>
      {alive && (
        <>
          <Field label="بچے کی جنس">
            <div className="grid grid-cols-2 gap-2">
              {[['f', '♀ مادہ'], ['m', '♂ نر']].map(([v, label]) => (
                <button key={v} onClick={() => setSex(v)} className={`rounded-card font-urdu text-lg border-2 ${sex === v ? 'border-rose bg-rose/10' : 'border-black/10 bg-white text-muted'}`} style={{ minHeight: 52 }}>{label}</button>
              ))}
            </div>
          </Field>
          <Field label="وزن kg (اختیاری)"><input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="numeric" className="gs-input num" placeholder="مثلاً 30" /></Field>
        </>
      )}
      <button onClick={save} className="gs-btn bg-ok text-white w-full text-xl mt-1">✅ محفوظ کریں</button>
      {alive && <div className="font-urdu text-sm text-muted text-center mt-2">بچہ خود بخود نئے جانور کے طور پر شامل ہو جائے گا</div>}
    </div>
  )
}
