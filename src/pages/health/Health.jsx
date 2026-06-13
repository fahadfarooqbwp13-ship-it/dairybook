import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees } from '../../lib/format.js'
import { shortDate, today, addDays } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { animalName } from '../../store/selectors.js'
import { VACCINES, vaccineLabel, SYMPTOMS, symptomLabel } from '../../lib/domain.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function Health() {
  const { t, lang } = useT()
  const s = useStore()
  const show = useToast((st) => st.show)
  const markVaccineDone = useStore((st) => st.markVaccineDone)
  const resolveHealthEvent = useStore((st) => st.resolveHealthEvent)
  const addHealthEvent = useStore((st) => st.addHealthEvent)
  const adjustMedicine = useStore((st) => st.adjustMedicine)
  const [tab, setTab] = useState('vaccines')

  return (
    <div className="pb-8">
      <PageHeader title={t('health_title')} color="bg-danger" />
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {[['vaccines', '💉 ' + t('health_vaccines')], ['illness', '🤒 ' + t('health_illness')], ['meds', '💊 ' + t('health_meds')]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-card font-urdu text-base ${tab === k ? 'bg-danger text-white' : 'bg-white text-muted'}`} style={{ minHeight: 48 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'vaccines' && <Vaccines s={s} t={t} lang={lang} markVaccineDone={markVaccineDone} show={show} />}
      {tab === 'illness' && <Illness s={s} t={t} lang={lang} resolve={resolveHealthEvent} addHealthEvent={addHealthEvent} show={show} />}
      {tab === 'meds' && <Meds s={s} t={t} lang={lang} adjust={adjustMedicine} />}
    </div>
  )
}

function Vaccines({ s, t, lang, markVaccineDone, show }) {
  const due = sel.dueVaccinations(s)
  return (
    <div className="px-4 mt-3 space-y-3">
      <h3 className="font-urdu text-lg font-bold">⏰ {t('health_due')}</h3>
      {due.length === 0 ? (
        <div className="gs-card p-3 font-urdu text-muted">کوئی ٹیکہ باقی نہیں</div>
      ) : (
        due.map((v) => {
          const overdue = v.daysTo < 0
          return (
            <div key={v.id} className={`gs-card p-3 flex items-center gap-3 border-s-[6px] ${overdue ? 'border-danger' : 'border-warn'}`}>
              <AnimalAvatar animal={v.animal} size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-urdu text-base font-bold">{animalName(v.animal)}</div>
                <div className="font-urdu text-sm text-muted">
                  {vaccineLabel(v.vaccine, lang)} · {overdue ? `${Math.abs(v.daysTo)} دن ${t('health_overdue')}` : `${v.daysTo} ${t('health_inDays')}`}
                </div>
              </div>
              <button
                onClick={() => {
                  const def = VACCINES.find((x) => x.id === v.vaccine)
                  markVaccineDone(v.id, addDays(today(), (def?.every || 6) * 30))
                  show(t('saved_ok'), true)
                }}
                className="gs-btn bg-ok text-white text-sm px-3 shrink-0"
                style={{ minHeight: 44 }}
              >
                {t('health_markDone')}
              </button>
              <EditBtn collection="vaccinations" id={v.id} />
            </div>
          )
        })
      )}

      {/* pre-loaded schedule */}
      <h3 className="font-urdu text-lg font-bold mt-4">📅 پاکستانی ٹیکہ شیڈول</h3>
      <div className="gs-card divide-y divide-black/5">
        {VACCINES.map((v) => (
          <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
            <span className="font-urdu text-base">{v.ur}</span>
            <span className="font-urdu text-sm text-muted">
              {v.monthsDue.length ? v.monthsDue.map((m) => ['', 'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'][m]).join('، ') : 'ایک بار'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Illness({ s, t, lang, resolve, addHealthEvent, show }) {
  const active = sel.activeHealth(s)
  const animals = s.animals.filter((a) => a.status !== 'sold' && a.status !== 'dead')
  const [animalId, setAnimalId] = useState(animals[0]?.id)
  const [syms, setSyms] = useState([])
  const [tx, setTx] = useState('')
  const toggleSym = (id) => setSyms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  function save() {
    if (!animalId || syms.length === 0) return
    addHealthEvent({ animalId, symptoms: syms, diagnosis: '', treatment: tx.trim(), date: today() })
    show(t('saved_ok'), true)
    setSyms([]); setTx('')
  }

  return (
    <div className="px-4 mt-3 space-y-3">
      <h3 className="font-urdu text-lg font-bold">🩺 {t('health_underTreatment')}</h3>
      {active.length === 0 ? (
        <div className="gs-card p-3 font-urdu text-muted">کوئی جانور زیرِ علاج نہیں</div>
      ) : (
        active.map((h) => (
          <div key={h.id} className="gs-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-urdu text-lg font-bold flex-1 min-w-0 truncate">{animalName(sel.findAnimal(s, h.animalId))}</div>
              <span className="font-urdu text-sm text-muted shrink-0">{shortDate(h.date, lang)}</span>
              <EditBtn collection="healthEvents" id={h.id} />
            </div>
            <div className="font-urdu text-sm text-muted mt-1">
              {h.symptoms.map(symptomLabel).join('، ')}{h.treatment ? ` · ${h.treatment}` : ''}
            </div>
            <button onClick={() => { resolve(h.id); show('ٹھیک ہو گیا ✅', true) }} className="gs-btn bg-ok text-white text-base mt-2" style={{ minHeight: 44 }}>
              ✅ {t('health_resolve')}
            </button>
          </div>
        ))
      )}

      {/* log illness */}
      <h3 className="font-urdu text-lg font-bold mt-3">➕ {t('health_logIllness')}</h3>
      <div className="gs-card p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {animals.map((a) => (
            <button key={a.id} onClick={() => setAnimalId(a.id)} className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${animalId === a.id ? 'bg-danger/10 ring-2 ring-danger' : ''}`} style={{ width: 60 }}>
              <AnimalAvatar animal={a} size={42} showTag={false} />
              <span className="num text-xs font-bold">{a.tag}</span>
            </button>
          ))}
        </div>
        <div className="font-urdu text-base text-muted mt-2 mb-1">علامات چنیں</div>
        <div className="grid grid-cols-4 gap-2">
          {SYMPTOMS.map((sy) => (
            <button key={sy.id} onClick={() => toggleSym(sy.id)} className={`gs-card flex flex-col items-center gap-0.5 py-2 ${syms.includes(sy.id) ? 'ring-2 ring-danger' : ''}`}>
              <span style={{ fontSize: 24 }}>{sy.icon}</span>
              <span className="font-urdu text-xs leading-tight text-center">{sy.ur}</span>
            </button>
          ))}
        </div>
        <input value={tx} onChange={(e) => setTx(e.target.value)} className="gs-input font-urdu mt-2" placeholder="علاج / دوائی (اختیاری)" />
        <button onClick={save} className="gs-btn bg-ok text-white mt-2 w-full">✅ {t('save')}</button>
      </div>
    </div>
  )
}

function Meds({ s, t, lang, adjust }) {
  return (
    <div className="px-4 mt-3 space-y-2">
      <h3 className="font-urdu text-lg font-bold">💊 {t('health_meds')}</h3>
      {s.medicines.map((m) => {
        const expDays = m.expiry ? Math.round((new Date(m.expiry + 'T00:00:00') - Date.now()) / 86400000) : 999
        const low = m.qty <= 3
        const expiring = expDays >= 0 && expDays <= 15
        return (
          <div key={m.id} className={`gs-card p-3 flex items-center gap-3 ${low || expiring ? 'border-s-[6px] border-warn' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="font-urdu text-lg font-bold">{m.name}</div>
              <div className="font-urdu text-sm text-muted">
                {m.expiry && <span className={expiring ? 'text-danger' : ''}>ختم: {shortDate(m.expiry, lang)}</span>}
                {low && <span className="text-danger"> · کم اسٹاک</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => adjust(m.id, -1)} className="gs-touch rounded-full bg-cream text-2xl font-bold text-accent flex items-center justify-center" style={{ width: 42, height: 42 }}>−</button>
              <span className="num text-lg font-bold w-10 text-center">{m.qty}<span className="text-xs text-muted block font-urdu">{m.unit}</span></span>
              <button onClick={() => adjust(m.id, 1)} className="gs-touch rounded-full bg-primary text-2xl font-bold text-white flex items-center justify-center" style={{ width: 42, height: 42 }}>+</button>
              <EditBtn collection="medicines" id={m.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
