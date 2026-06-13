import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { today } from '../../lib/date.js'
import PageHeader from '../../components/PageHeader.jsx'

const DATA_KEYS = [
  'farmName', 'ownerName', 'animals', 'milkLogs', 'buyers', 'deliveries', 'payments',
  'expenses', 'employees', 'salaryPayments', 'breedingEvents', 'vaccinations',
  'healthEvents', 'medicines', 'transactions', 'lastBackupAt',
]

export default function Backup() {
  const { t, lang } = useT()
  const s = useStore()
  const setLastBackup = useStore((st) => st.setLastBackup)
  const importData = useStore((st) => st.importData)
  const show = useToast((st) => st.show)
  const fileRef = useRef(null)
  const [err, setErr] = useState('')

  const last = s.lastBackupAt ? new Date(s.lastBackupAt) : null
  const hoursAgo = last ? Math.round((Date.now() - last) / 3600000) : null
  const status =
    !last ? { color: 'bg-danger', icon: '🔴', text: t('backup_never') }
      : hoursAgo > 72 ? { color: 'bg-danger', icon: '🔴', text: `${Math.round(hoursAgo / 24)} دن سے بیک اپ نہیں` }
      : hoursAgo > 12 ? { color: 'bg-warn', icon: '🟡', text: `${hoursAgo} گھنٹے پہلے` }
      : { color: 'bg-ok', icon: '✅', text: `${t('backup_done')} — ${hoursAgo === 0 ? 'ابھی' : hoursAgo + ' گھنٹے پہلے'}` }

  function exportFile() {
    const payload = { _meta: { app: 'DairyBook', version: 3, exportedAt: new Date().toISOString() } }
    DATA_KEYS.forEach((k) => { payload[k] = s[k] })
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dairybook-backup-${today()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setLastBackup(new Date().toISOString())
    show(t('saved_ok'), false)
  }

  function onFile(e) {
    setErr('')
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data.animals) throw new Error('bad')
        importData(data)
        show(lang === 'ur' ? 'ڈیٹا واپس آ گیا ✅' : 'Data restored ✅', false)
      } catch {
        setErr(lang === 'ur' ? 'فائل درست نہیں' : 'Invalid file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const counts = `${s.animals.length} جانور · ${s.buyers.length} خریدار · ${s.milkLogs.length} دودھ ریکارڈ`

  return (
    <div className="pb-8">
      <PageHeader title={t('backup_title')} color="bg-sky" />

      {/* status */}
      <div className="px-4 mt-3">
        <div className={`${status.color} text-white rounded-card p-5 text-center shadow`}>
          <div style={{ fontSize: 40 }}>{status.icon}</div>
          <div className="font-urdu text-xl font-bold mt-1">{status.text}</div>
          <div className="font-urdu text-sm opacity-90 mt-1">{counts}</div>
        </div>
      </div>

      {/* actions */}
      <div className="px-4 mt-4 space-y-3">
        <button onClick={exportFile} className="gs-btn bg-primary text-white w-full">💾 {t('backup_export')}</button>

        <label className="gs-btn bg-white text-primary border-2 border-primary/20 w-full cursor-pointer">
          📥 {t('backup_restore')}
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </label>
        {err && <div className="font-urdu text-danger text-center">{err}</div>}
      </div>

      {/* what's backed up */}
      <div className="px-4 mt-5">
        <h3 className="font-urdu text-lg font-bold mb-1">📦 کیا محفوظ ہوتا ہے</h3>
        <div className="gs-card p-4 font-urdu text-base leading-loose text-muted">
          ✅ تمام جانور، دودھ ریکارڈ اور تاریخ<br />
          ✅ خریدار، کھاتے اور ادائیگیاں<br />
          ✅ اخراجات، تنخواہیں، صحت اور افزائش<br />
          ✅ فارم کی ترتیبات
        </div>
      </div>

      {/* google drive note */}
      <div className="px-4 mt-4">
        <div className="gs-card p-4">
          <div className="font-urdu text-lg font-bold flex items-center gap-2">☁️ گوگل ڈرائیو</div>
          <div className="font-urdu text-base text-muted leading-relaxed mt-1">
            بیک اپ فائل محفوظ کر کے اسے گوگل ڈرائیو میں «DairyBook Backup» فولڈر میں رکھ دیں — آپ کا ڈیٹا محفوظ رہے گا۔ خودکار ڈرائیو سِنک جلد آ رہا ہے۔
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 text-center font-urdu text-sm text-muted">
        💡 ہر فیچر انٹرنیٹ کے بغیر بھی کام کرتا ہے — ڈیٹا آپ کے فون میں محفوظ رہتا ہے
      </div>
    </div>
  )
}
