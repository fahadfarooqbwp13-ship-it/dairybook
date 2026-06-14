import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { shortDate, today, addDays } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { animalName, findAnimal } from '../../store/selectors.js'
import { VACCINES, vaccineLabel } from '../../lib/domain.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function Health() {
  const { t, lang } = useT()
  const s = useStore()
  const show = useToast((st) => st.show)
  const [tab, setTab] = useState('medicine')

  return (
    <div className="pb-8">
      <PageHeader title="صحت اور دوائیں" color="bg-danger" />
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {[['medicine', '💊 دوائی'], ['stock', '📦 اسٹاک'], ['vaccines', '💉 ٹیکے']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-card font-urdu text-base ${tab === k ? 'bg-danger text-white' : 'bg-white text-muted'}`} style={{ minHeight: 48 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'medicine' && <MedicineGiven s={s} show={show} lang={lang} />}
      {tab === 'stock' && <Inventory s={s} show={show} lang={lang} t={t} />}
      {tab === 'vaccines' && <Vaccines s={s} t={t} lang={lang} show={show} />}
    </div>
  )
}

// ---- give medicine to an animal + per-animal records ----
function MedicineGiven({ s, show, lang }) {
  const addMedicineLog = useStore((st) => st.addMedicineLog)
  const animals = s.animals.filter((a) => a.status !== 'sold' && a.status !== 'dead')
  const [animalId, setAnimalId] = useState(animals[0]?.id)
  const [f, setF] = useState({ name: '', dose: '', date: today(), days: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  function save() {
    if (!animalId || !f.name.trim()) return
    addMedicineLog({ animalId, name: f.name.trim(), dose: f.dose.trim(), date: f.date, days: +f.days || 0 })
    show(lang === 'ur' ? 'دوائی ریکارڈ ہو گئی ✅' : 'Medicine recorded ✅', true)
    setF({ name: '', dose: '', date: today(), days: '' })
  }

  const logs = s.medicineLogs.slice().sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="px-4 mt-3 space-y-3">
      <div className="gs-card p-3">
        <div className="font-urdu text-xl font-bold text-danger mb-2">💊 دوائی دیں</div>
        <div className="font-urdu text-base text-muted mb-1">کون سا جانور؟</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {animals.map((a) => (
            <button key={a.id} onClick={() => setAnimalId(a.id)} className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${animalId === a.id ? 'bg-danger/10 ring-2 ring-danger' : ''}`} style={{ width: 62 }}>
              <AnimalAvatar animal={a} size={44} showTag={false} />
              <span className="num text-xs font-bold">{a.tag}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          <input value={f.name} onChange={set('name')} className="gs-input font-urdu" placeholder="دوائی کا نام" />
          <div className="grid grid-cols-2 gap-2">
            <input value={f.dose} onChange={set('dose')} className="gs-input font-urdu" placeholder="مقدار (مثلاً 10ml)" />
            <input value={f.days} onChange={set('days')} inputMode="numeric" className="gs-input num" placeholder="کتنے دن" />
          </div>
          <div>
            <div className="font-urdu text-sm text-muted mb-1">تاریخ</div>
            <input type="date" value={f.date} onChange={set('date')} className="gs-input num" />
          </div>
          <button onClick={save} className="gs-btn bg-ok text-white w-full">✅ محفوظ کریں</button>
        </div>
      </div>

      <h3 className="font-urdu text-lg font-bold">📋 دی گئی دوائیں</h3>
      {logs.length === 0 ? (
        <div className="gs-card p-3 font-urdu text-muted">ابھی کوئی ریکارڈ نہیں</div>
      ) : (
        <div className="gs-card divide-y divide-black/5">
          {logs.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="font-urdu text-base font-bold truncate">{animalName(findAnimal(s, m.animalId))} — {m.name}</div>
                <div className="font-urdu text-sm text-muted">{shortDate(m.date, lang)}{m.dose ? ` · ${m.dose}` : ''}{m.days ? ` · ${m.days} دن` : ''}</div>
              </div>
              <EditBtn collection="medicineLogs" id={m.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- medicine inventory: add / edit / delete / low-stock ----
function Inventory({ s, show, lang, t }) {
  const addMedicine = useStore((st) => st.addMedicine)
  const adjust = useStore((st) => st.adjustMedicine)
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ name: '', qty: '', unit: '', expiry: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  function save() {
    if (!f.name.trim()) return
    addMedicine({ name: f.name.trim(), qty: +f.qty || 0, unit: f.unit.trim() || 'عدد', expiry: f.expiry })
    show(t('saved_ok'), true)
    setF({ name: '', qty: '', unit: '', expiry: '' })
    setAdding(false)
  }

  return (
    <div className="px-4 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-urdu text-lg font-bold">📦 دوائی اسٹاک</h3>
        <button onClick={() => setAdding((v) => !v)} className="gs-btn bg-primary text-white text-base px-3" style={{ minHeight: 44 }}>{adding ? 'بند کریں' : '➕ نئی دوائی'}</button>
      </div>

      {adding && (
        <div className="gs-card p-3 space-y-2">
          <input value={f.name} onChange={set('name')} className="gs-input font-urdu" placeholder="دوائی کا نام" />
          <div className="grid grid-cols-2 gap-2">
            <input value={f.qty} onChange={set('qty')} inputMode="numeric" className="gs-input num" placeholder="تعداد" />
            <input value={f.unit} onChange={set('unit')} className="gs-input font-urdu" placeholder="یونٹ (شیشی)" />
          </div>
          <div>
            <div className="font-urdu text-sm text-muted mb-1">ختم ہونے کی تاریخ</div>
            <input type="date" value={f.expiry} onChange={set('expiry')} className="gs-input num" />
          </div>
          <button onClick={save} className="gs-btn bg-ok text-white w-full">✅ محفوظ کریں</button>
        </div>
      )}

      {s.medicines.length === 0 && !adding && <div className="gs-card p-3 font-urdu text-muted">اسٹاک خالی ہے</div>}

      {s.medicines.map((m) => {
        const expDays = m.expiry ? Math.round((new Date(m.expiry + 'T00:00:00') - Date.now()) / 86400000) : 999
        const low = m.qty <= 3
        const expiring = expDays >= 0 && expDays <= 15
        return (
          <div key={m.id} className={`gs-card p-3 flex items-center gap-3 ${low || expiring ? 'border-s-[6px] border-warn' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="font-urdu text-lg font-bold truncate">{m.name}</div>
              <div className="font-urdu text-sm text-muted">
                {m.expiry && <span className={expiring ? 'text-danger' : ''}>ختم: {shortDate(m.expiry, lang)}</span>}
                {low && <span className="text-danger"> · ⚠️ کم اسٹاک</span>}
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

// ---- vaccines (kept) ----
function Vaccines({ s, t, lang, show }) {
  const markVaccineDone = useStore((st) => st.markVaccineDone)
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
                <div className="font-urdu text-base font-bold truncate">{animalName(v.animal)}</div>
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
