import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { liters, lnum } from '../../lib/format.js'
import { today, addDays } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import NumberPad from '../../components/NumberPad.jsx'

export default function MilkLog() {
  const { t } = useT()
  const s = useStore()
  const upsertMilk = useStore((st) => st.upsertMilk)
  const upsertBulkMilk = useStore((st) => st.upsertBulkMilk)
  const show = useToast((st) => st.show)

  const milkers = sel.milkers(s)
  const t0 = today()
  const yday = addDays(t0, -1)

  const [sel0] = useState(() => milkers.find((a) => !sel.logFor(s, a.id, t0))?.id || milkers[0]?.id)
  const [animalId, setAnimalId] = useState(sel0)
  const [field, setField] = useState('morning')
  const [m, setM] = useState('')
  const [e, setE] = useState('')
  const [mode, setMode] = useState('animal') // 'animal' | 'bulk'

  function switchMode(next) {
    setMode(next)
    setField('morning')
    if (next === 'bulk') {
      const bl = s.bulkMilk.find((b) => b.date === t0)
      setM(bl ? lnum(bl.morning) : '')
      setE(bl ? lnum(bl.evening) : '')
    } else if (animalId) {
      pick(animalId)
    }
  }

  function saveBulk() {
    upsertBulkMilk(t0, +m || 0, +e || 0)
    show(t('saved_ok'), true)
  }

  // load an animal into the editor (prefill today, else yesterday as smart default)
  function pick(id) {
    setAnimalId(id)
    const tl = sel.logFor(s, id, t0)
    const yl = sel.logFor(s, id, yday)
    setM(tl ? lnum(tl.morning) : yl ? lnum(yl.morning) : '')
    setE(tl ? lnum(tl.evening) : yl ? lnum(yl.evening) : '')
    setField('morning')
  }

  // prefill the initially-selected animal on first open
  useEffect(() => {
    if (sel0) pick(sel0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function save() {
    if (!animalId) return
    upsertMilk(animalId, t0, +m || 0, +e || 0)
    show(t('saved_ok'), true)
    // jump to next animal not yet logged today
    const next = milkers.find((a) => a.id !== animalId && !sel.logFor(s, a.id, t0))
    if (next) pick(next.id)
  }

  const animal = milkers.find((a) => a.id === animalId)
  const total = (+m || 0) + (+e || 0)
  const val = field === 'morning' ? m : e
  const setVal = field === 'morning' ? setM : setE

  return (
    <div className="pb-4 h-full flex flex-col">
      <PageHeader title={t('milk_logTitle')} color="bg-sky" />

      {/* mode: log each animal, OR just the day's total when too busy */}
      <div className="px-3 pt-3 grid grid-cols-2 gap-2">
        <button onClick={() => switchMode('animal')} className={`rounded-card font-urdu text-lg ${mode === 'animal' ? 'bg-sky text-white' : 'bg-white text-muted border-2 border-black/10'}`} style={{ minHeight: 50 }}>🐄 فی جانور</button>
        <button onClick={() => switchMode('bulk')} className={`rounded-card font-urdu text-lg ${mode === 'bulk' ? 'bg-sky text-white' : 'bg-white text-muted border-2 border-black/10'}`} style={{ minHeight: 50 }}>🥛 کل دودھ</button>
      </div>

      {mode === 'animal' && (
      <>
      {/* animal picker — photo thumbnails, not a dropdown */}
      <div className="px-3 pt-3">
        <div className="font-urdu text-base text-muted mb-1">{t('milk_pickAnimal')}</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {milkers.map((a) => {
            const logged = !!sel.logFor(s, a.id, t0)
            const active = a.id === animalId
            return (
              <button
                key={a.id}
                onClick={() => pick(a.id)}
                className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${
                  active ? 'bg-sky/15 ring-2 ring-sky' : ''
                }`}
                style={{ width: 70 }}
              >
                <div className="relative">
                  <AnimalAvatar animal={a} size={52} showTag={false} />
                  {logged && (
                    <span className="absolute -top-1 -end-1 bg-ok text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </div>
                <span className="num text-sm font-bold text-ink">{a.tag}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* entry panel */}
      {animal && (
        <div className="px-3 mt-2 flex-1 flex flex-col">
          <div className="gs-card p-3 flex items-center gap-3">
            <AnimalAvatar animal={animal} size={48} />
            <div className="flex-1">
              <div className="font-urdu text-lg font-bold">{animal.name || `نمبر ${animal.tag}`}</div>
              <div className="font-urdu text-sm text-muted">{animal.breed}</div>
            </div>
            <div className="text-end">
              <div className="num text-3xl font-bold text-sky">{liters(total)}</div>
              <div className="font-urdu text-xs text-muted">{t('total')}</div>
            </div>
          </div>

          {/* morning / evening toggle chips */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              ['morning', m, '🌅'],
              ['evening', e, '🌙'],
            ].map(([f, v, ic]) => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`rounded-card p-2 border-2 flex items-center justify-between px-3 ${
                  field === f ? 'border-sky bg-sky/10' : 'border-black/10 bg-white'
                }`}
                style={{ minHeight: 56 }}
              >
                <span className="font-urdu text-lg">{ic} {t(f)}</span>
                <span className="num text-2xl font-bold text-ink">{v || '0'}</span>
              </button>
            ))}
          </div>

          <div className="mt-2">
            <NumberPad value={val} onChange={setVal} />
          </div>

          <button onClick={save} className="gs-btn bg-ok text-white mt-3 text-2xl">
            ✅ {t('confirm')}
          </button>
        </div>
      )}
      </>
      )}

      {mode === 'bulk' && (
        <div className="px-3 mt-2 flex-1 flex flex-col">
          <div className="gs-card p-3 text-center">
            <div className="font-urdu text-base text-muted">آج کا کل دودھ (سب جانور ملا کر)</div>
            <div className="num text-4xl font-bold text-sky">{liters((+m || 0) + (+e || 0))}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[['morning', m, '🌅'], ['evening', e, '🌙']].map(([f, v, ic]) => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`rounded-card p-2 border-2 flex items-center justify-between px-3 ${field === f ? 'border-sky bg-sky/10' : 'border-black/10 bg-white'}`}
                style={{ minHeight: 56 }}
              >
                <span className="font-urdu text-lg">{ic} {t(f)}</span>
                <span className="num text-2xl font-bold text-ink">{v || '0'}</span>
              </button>
            ))}
          </div>
          <div className="mt-2"><NumberPad value={val} onChange={setVal} /></div>
          <button onClick={saveBulk} className="gs-btn bg-ok text-white mt-3 text-2xl">✅ {t('confirm')}</button>
        </div>
      )}
    </div>
  )
}
