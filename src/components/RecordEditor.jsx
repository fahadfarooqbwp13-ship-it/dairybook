import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useEditor } from '../store/useEditor.js'
import { useToast } from '../store/useToast.js'
import { useT } from '../i18n/useT.js'
import { getSchema, NUMERIC_KEYS } from '../lib/recordSchemas.js'

// One editor for every record type, driven by recordSchemas. Has both an
// Edit (Save) action and a Delete (soft-delete → recycle bin) action.
export default function RecordEditor() {
  const { editing, close } = useEditor()
  const { t, lang } = useT()
  const updateRecord = useStore((s) => s.updateRecord)
  const softDelete = useStore((s) => s.softDelete)
  const record = useStore((s) => (editing ? s[editing.collection]?.find((r) => r.id === editing.id) : null))
  const show = useToast((s) => s.show)
  const [form, setForm] = useState({})

  const schema = editing ? getSchema(editing.collection) : null

  useEffect(() => {
    if (record && schema) {
      const f = {}
      schema.fields.forEach((fl) => { f[fl.key] = record[fl.key] ?? '' })
      setForm(f)
    }
  }, [editing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editing || !schema || !record) return null

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  function save() {
    const patch = {}
    schema.fields.forEach((fl) => {
      patch[fl.key] = NUMERIC_KEYS.has(fl.key) ? +form[fl.key] || 0 : form[fl.key]
    })
    if (editing.collection === 'deliveries') patch.amount = Math.round((+patch.liters || 0) * (+patch.rate || 0))
    updateRecord(editing.collection, editing.id, patch)
    show(t('saved_ok'), true)
    close()
  }

  function del() {
    softDelete(editing.collection, editing.id)
    show(lang === 'ur' ? 'ردی کی ٹوکری میں چلا گیا 🗑️' : 'Moved to recycle bin 🗑️', true)
    close()
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end" onClick={close}>
      <div className="bg-surface rounded-t-3xl w-full max-h-[85%] overflow-y-auto p-5" style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-urdu text-2xl font-bold text-ink">✏️ {schema.title[lang]} — {t('edit')}</div>
          <button onClick={close} className="gs-touch text-3xl text-muted flex items-center justify-center" style={{ width: 40, height: 40 }}>×</button>
        </div>

        <div className="space-y-3">
          {schema.fields.map((fl) => (
            <label key={fl.key} className="block">
              <span className="font-urdu text-base text-muted block mb-1">{fl.label[lang]}</span>
              {fl.type === 'select' ? (
                <select value={form[fl.key] ?? ''} onChange={set(fl.key)} className="gs-input font-urdu">
                  {fl.options().map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  value={form[fl.key] ?? ''}
                  onChange={set(fl.key)}
                  type={fl.type === 'date' ? 'date' : 'text'}
                  inputMode={fl.type === 'number' ? 'numeric' : undefined}
                  className={`gs-input ${fl.type === 'number' || fl.type === 'date' ? 'num' : 'font-urdu'}`}
                />
              )}
            </label>
          ))}
        </div>

        <button onClick={save} className="gs-btn bg-ok text-white w-full mt-4 text-xl">✅ {t('save')}</button>
        <button onClick={del} className="gs-btn bg-white text-danger border-2 border-danger/30 w-full mt-2">
          🗑️ {lang === 'ur' ? 'حذف کریں' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
