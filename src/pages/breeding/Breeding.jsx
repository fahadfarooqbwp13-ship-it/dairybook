import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { shortDate, today, addDays } from '../../lib/date.js'
import { GESTATION_DAYS } from '../../lib/domain.js'
import * as sel from '../../store/selectors.js'
import { animalName } from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function Breeding() {
  const { t, lang } = useT()
  const s = useStore()
  const addBreedingEvent = useStore((st) => st.addBreedingEvent)
  const recordCalving = useStore((st) => st.recordCalving)
  const show = useToast((st) => st.show)

  const females = s.animals.filter((a) => a.sex === 'f' && a.status !== 'sold' && a.status !== 'dead')
  const [animalId, setAnimalId] = useState(females[0]?.id)
  const [type, setType] = useState('heat')
  const [method, setMethod] = useState('ai')
  const [calf, setCalf] = useState(null) // calving form: { motherId, sex }

  const upcoming = sel.upcomingCalvings(s)
  const expected = type === 'mating' ? addDays(today(), GESTATION_DAYS) : null

  function logEvent() {
    if (!animalId) return
    addBreedingEvent({
      animalId,
      type,
      date: today(),
      method: type === 'mating' ? method : '',
      aiDetails: type === 'mating' && method === 'ai' ? 'مصنوعی نسل' : '',
      expectedCalving: type === 'mating' ? expected : '',
    })
    if (type === 'mating') useStore.getState().updateAnimal(animalId, { status: 'pregnant' })
    show(t('saved_ok'), true)
  }

  function saveCalf(sex, weight) {
    recordCalving(calf.motherId, { sex, weight })
    show('بچہ مبارک ہو! 🍼', true)
    setCalf(null)
  }

  const recent = s.breedingEvents.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12)
  const typeLabel = { heat: t('breed_heat'), mating: t('breed_mating'), pregnancy: t('breed_pregnancy'), calving: t('breed_calving') }
  const typeIcon = { heat: '🔴', mating: '🟡', pregnancy: '🟣', calving: '🟢' }

  return (
    <div className="pb-8">
      <PageHeader title={t('breed_title')} color="bg-rose" />

      {/* upcoming calvings */}
      <div className="px-4 mt-3">
        <h3 className="font-urdu text-lg font-bold mb-1">🍼 {t('breed_upcoming')}</h3>
        {upcoming.length === 0 ? (
          <div className="gs-card p-3 font-urdu text-muted">کوئی متوقع بچہ نہیں</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((u) => (
              <div key={u.id} className="gs-card p-3 flex items-center gap-3">
                <AnimalAvatar animal={u.animal} size={48} />
                <div className="flex-1">
                  <div className="font-urdu text-lg font-bold">{animalName(u.animal)}</div>
                  <div className="font-urdu text-sm text-muted">{t('breed_expected')}: {shortDate(u.expectedCalving, lang)}</div>
                </div>
                {u.daysLeft > 3 ? (
                  <span className="font-urdu text-base bg-rose/15 text-rose rounded-full px-3 py-1 num">{u.daysLeft} دن</span>
                ) : (
                  <button onClick={() => setCalf({ motherId: u.animal.id })} className="gs-btn bg-ok text-white text-base px-3" style={{ minHeight: 44 }}>
                    🍼 {t('breed_recordCalf')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* record calf form */}
      {calf && (
        <div className="px-4 mt-3">
          <div className="gs-card p-3">
            <div className="font-urdu text-lg font-bold mb-2">🍼 {t('breed_recordCalf')}</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => saveCalf('f', 0)} className="gs-btn bg-rose text-white">♀ {t('animals_female')}</button>
              <button onClick={() => saveCalf('m', 0)} className="gs-btn bg-sky text-white">♂ {t('animals_male')}</button>
            </div>
            <button onClick={() => setCalf(null)} className="font-urdu text-muted mt-2 w-full">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* log a breeding event */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-2">➕ {t('breed_log')}</h3>
        <div className="gs-card p-3">
          {/* animal picker */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {females.map((a) => (
              <button key={a.id} onClick={() => setAnimalId(a.id)} className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${animalId === a.id ? 'bg-rose/15 ring-2 ring-rose' : ''}`} style={{ width: 64 }}>
                <AnimalAvatar animal={a} size={46} showTag={false} />
                <span className="num text-xs font-bold">{a.tag}</span>
              </button>
            ))}
          </div>

          {/* type */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[['heat', '🔴 ' + t('breed_heat')], ['mating', '🟡 ' + t('breed_mating')]].map(([k, label]) => (
              <button key={k} onClick={() => setType(k)} className={`rounded-card font-urdu text-lg border-2 ${type === k ? 'border-rose bg-rose/10' : 'border-black/10 bg-white'}`} style={{ minHeight: 52 }}>
                {label}
              </button>
            ))}
          </div>

          {type === 'mating' && (
            <>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[['ai', 'مصنوعی نسل'], ['natural', 'قدرتی']].map(([k, label]) => (
                  <button key={k} onClick={() => setMethod(k)} className={`rounded-card font-urdu text-base border-2 ${method === k ? 'border-rose bg-rose/10' : 'border-black/10 bg-white'}`} style={{ minHeight: 48 }}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="font-urdu text-base text-muted mt-2 text-center">
                {t('breed_expected')}: <span className="num font-bold text-rose">{shortDate(expected, lang)}</span> ({GESTATION_DAYS} دن)
              </div>
            </>
          )}

          <button onClick={logEvent} className="gs-btn bg-ok text-white mt-3 w-full">✅ {t('save')}</button>
        </div>
      </div>

      {/* recent events */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📋 حالیہ واقعات</h3>
        <div className="gs-card divide-y divide-black/5">
          {recent.map((b) => {
            const a = sel.findAnimal(s, b.animalId)
            return (
              <div key={b.id} className="flex items-center gap-2 px-3 py-2">
                <span style={{ fontSize: 18 }} className="shrink-0">{typeIcon[b.type]}</span>
                <div className="flex-1 min-w-0 font-urdu text-base truncate">{animalName(a)} — {typeLabel[b.type]}</div>
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
