import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { addDays, today } from '../../lib/date.js'
import { fileToCompressedDataURL } from '../../lib/image.js'
import { SPECIES, speciesInfo } from '../../lib/domain.js'
import PageHeader from '../../components/PageHeader.jsx'
import VoiceButton from '../../components/VoiceButton.jsx'
import AnimalAvatar from '../../components/AnimalAvatar.jsx'

const BREEDS = ['ساہیوال', 'نیلی راوی', 'چولستانی', 'کنڈی', 'فریزین کراس', 'دیسی']

export default function AnimalEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, lang } = useT()
  const addAnimal = useStore((s) => s.addAnimal)
  const updateAnimal = useStore((s) => s.updateAnimal)
  const animals = useStore((s) => s.animals)
  const existing = useStore((s) => (id ? s.animals.find((a) => a.id === id) : null))
  const show = useToast((s) => s.show)
  const isEdit = !!existing

  const ageInit = existing?.dob
    ? Math.max(0, Math.round((Date.now() - new Date(existing.dob + 'T00:00:00')) / (86400000 * 365)))
    : ''

  const [f, setF] = useState({
    tag: existing?.tag || '',
    name: existing?.name || '',
    species: existing?.species || 'cow',
    sex: existing?.sex || 'f',
    breed: existing?.breed || '',
    status: existing?.status || 'active',
    weight: existing?.weight || '',
    ageYears: ageInit,
    photo: existing?.photo || '',
    speciesName: existing?.speciesName || '',
    motherId: existing?.motherId || '',
    fatherId: existing?.fatherId || '',
  })

  const others = animals.filter((a) => a.id !== id)
  const femaleParents = others.filter((a) => a.sex === 'f')
  const maleParents = others.filter((a) => a.sex === 'm')
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToCompressedDataURL(file)
      setF((p) => ({ ...p, photo: dataUrl }))
    } catch {
      /* ignore decode errors */
    }
    e.target.value = ''
  }

  const emoji = speciesInfo(f.species).emoji
  const tint = speciesInfo(f.species).tint

  function save() {
    const data = {
      tag: f.tag.trim() || '?',
      name: f.name.trim(),
      species: f.species,
      speciesName: f.species === 'other' ? f.speciesName.trim() : '',
      sex: f.sex,
      breed: f.breed.trim(),
      status: f.status,
      weight: +f.weight || 0,
      photo: f.photo,
      motherId: f.motherId,
      fatherId: f.fatherId,
      dob: f.ageYears !== '' ? addDays(today(), -Math.round(+f.ageYears * 365)) : existing?.dob || '',
    }
    if (isEdit) {
      updateAnimal(id, data)
      show(t('saved_ok'), true)
      nav(-1)
    } else {
      const newId = addAnimal(data)
      show(t('saved_ok'), true)
      nav(`/animals/${newId}`, { replace: true })
    }
  }

  return (
    <div className="pb-8">
      <PageHeader title={isEdit ? t('edit') : t('animals_add')} color="bg-primary" />

      {/* photo: camera or gallery */}
      <div className="px-4 mt-4 flex flex-col items-center">
        <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: 104, height: 104, background: tint }}>
          {f.photo ? (
            <img src={f.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: 52 }}>{emoji}</span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <label className="gs-btn bg-primary text-white text-base px-4 cursor-pointer" style={{ minHeight: 48 }}>
            📷 کیمرہ
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
          </label>
          <label className="gs-btn bg-white text-primary border-2 border-primary/20 text-base px-4 cursor-pointer" style={{ minHeight: 48 }}>
            🖼️ گیلری
            <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
          </label>
          {f.photo && (
            <button onClick={() => set('photo')('')} className="gs-btn bg-white text-danger border-2 border-danger/20 text-base px-3" style={{ minHeight: 48 }}>✕</button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <Field label={t('animals_tag')}>
          <input
            value={f.tag}
            onChange={(e) => set('tag')(e.target.value)}
            inputMode="numeric"
            className="gs-input num"
            placeholder="مثلاً 7"
          />
        </Field>

        <Field label={t('animals_name')}>
          <div className="flex gap-2">
            <input value={f.name} onChange={(e) => set('name')(e.target.value)} className="gs-input font-urdu flex-1" placeholder="مثلاً ہیرا" />
            <VoiceButton onResult={(txt) => set('name')(txt)} lang={lang} />
          </div>
        </Field>

        <Field label="قسم (جانور)">
          <div className="grid grid-cols-3 gap-2">
            {SPECIES.map((sp) => (
              <button
                key={sp.id}
                onClick={() => set('species')(sp.id)}
                className={`rounded-card font-urdu text-base flex flex-col items-center justify-center gap-0.5 py-2 border-2 ${
                  f.species === sp.id ? 'border-primary bg-primary/10' : 'border-black/5 bg-white text-muted'
                }`}
                style={{ minHeight: 64 }}
              >
                <span style={{ fontSize: 26 }}>{sp.emoji}</span>
                <span>{sp.ur}</span>
              </button>
            ))}
          </div>
          {f.species === 'other' && (
            <input
              value={f.speciesName}
              onChange={(e) => set('speciesName')(e.target.value)}
              className="gs-input font-urdu mt-2"
              placeholder="جانور کی قسم لکھیں"
            />
          )}
        </Field>

        <Field label={t('animals_sex')}>
          <Toggle
            value={f.sex}
            onChange={set('sex')}
            options={[
              { v: 'f', label: '♀ ' + t('animals_female') },
              { v: 'm', label: '♂ ' + t('animals_male') },
            ]}
          />
        </Field>

        <Field label={t('animals_breed')}>
          <div className="flex gap-2 flex-wrap">
            {BREEDS.map((b) => (
              <button
                key={b}
                onClick={() => set('breed')(b)}
                className={`px-3 rounded-full font-urdu text-base ${f.breed === b ? 'bg-primary text-white' : 'bg-white text-muted'}`}
                style={{ minHeight: 44 }}
              >
                {b}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t('animals_age')} (${t('animals_years')})`}>
            <input value={f.ageYears} onChange={(e) => set('ageYears')(e.target.value)} inputMode="numeric" className="gs-input num" placeholder="4" />
          </Field>
          <Field label={`${t('animals_weight')} (kg)`}>
            <input value={f.weight} onChange={(e) => set('weight')(e.target.value)} inputMode="numeric" className="gs-input num" placeholder="420" />
          </Field>
        </div>

        <Field label={t('animals_status')}>
          <Toggle
            value={f.status}
            onChange={set('status')}
            wrap
            options={[
              { v: 'active', label: '✅ ' + t('animals_active') },
              { v: 'pregnant', label: '🤰 ' + t('animals_pregnant') },
              { v: 'calf', label: '🍼 ' + t('animals_calf') },
            ]}
          />
        </Field>

        {/* parents (family tree) */}
        <div>
          <span className="font-urdu text-lg text-muted block mb-1">🌳 ماں (اختیاری)</span>
          <ParentRow candidates={femaleParents} value={f.motherId} onChange={set('motherId')} />
        </div>
        <div>
          <span className="font-urdu text-lg text-muted block mb-1">🌳 باپ (اختیاری)</span>
          <ParentRow candidates={maleParents} value={f.fatherId} onChange={set('fatherId')} />
        </div>

        <button onClick={save} className="gs-btn bg-ok text-white text-2xl mt-2">
          ✅ {t('save')}
        </button>
      </div>
    </div>
  )
}

function ParentRow({ candidates, value, onChange }) {
  if (candidates.length === 0) return <div className="font-urdu text-sm text-muted">کوئی دستیاب نہیں</div>
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        type="button"
        onClick={() => onChange('')}
        className={`shrink-0 flex flex-col items-center justify-center gap-1 rounded-2xl ${!value ? 'bg-primary/10 ring-2 ring-primary' : 'bg-white'}`}
        style={{ width: 64, height: 68 }}
      >
        <span style={{ fontSize: 22 }} className="opacity-60">❔</span>
        <span className="font-urdu text-xs">نامعلوم</span>
      </button>
      {candidates.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onChange(a.id)}
          className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${value === a.id ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
          style={{ width: 64 }}
        >
          <AnimalAvatar animal={a} size={46} showTag={false} />
          <span className="num text-xs font-bold">{a.tag}</span>
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="font-urdu text-lg text-muted block mb-1">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ value, onChange, options, wrap }) {
  return (
    <div className={`flex gap-2 ${wrap ? 'flex-wrap' : ''}`}>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-card font-urdu text-lg px-3 ${
            value === o.v ? 'bg-primary text-white' : 'bg-white text-muted border-2 border-black/5'
          }`}
          style={{ minHeight: 56 }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
