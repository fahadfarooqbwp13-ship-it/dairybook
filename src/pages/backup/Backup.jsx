import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { today } from '../../lib/date.js'
import { getClientId, setClientId, isConfigured, hasToken, uploadBackup, downloadBackup } from '../../lib/googleDrive.js'
import { shareFile } from '../../lib/share.js'
import PageHeader from '../../components/PageHeader.jsx'

const DATA_KEYS = [
  'farmName', 'ownerName', 'animals', 'milkLogs', 'bulkMilk', 'buyers', 'deliveries', 'payments',
  'expenses', 'employees', 'salaryPayments', 'breedingEvents', 'vaccinations',
  'healthEvents', 'medicines', 'medicineLogs', 'transactions', 'customAlerts', 'recycleBin', 'lastBackupAt',
]
const GBACKUP_AT = 'dairybook-gbackup-at'

export default function Backup() {
  const { t, lang } = useT()
  const s = useStore()
  const setLastBackup = useStore((st) => st.setLastBackup)
  const importData = useStore((st) => st.importData)
  const show = useToast((st) => st.show)
  const fileRef = useRef(null)
  const [err, setErr] = useState('')
  // google drive state
  const [gConfigured, setGConfigured] = useState(isConfigured())
  const [cid, setCid] = useState(getClientId())
  const [gBusy, setGBusy] = useState(false)
  const [gAt, setGAt] = useState(localStorage.getItem(GBACKUP_AT) || '')

  function buildPayload() {
    const payload = { _meta: { app: 'DairyBook', version: 5, exportedAt: new Date().toISOString() } }
    DATA_KEYS.forEach((k) => { payload[k] = s[k] })
    return payload
  }

  async function driveBackup() {
    setGBusy(true); setErr('')
    try {
      await uploadBackup(JSON.stringify(buildPayload()))
      const now = new Date().toISOString()
      localStorage.setItem(GBACKUP_AT, now); setGAt(now)
      setLastBackup(now)
      show(lang === 'ur' ? 'گوگل ڈرائیو پر بیک اپ ہو گیا ✅' : 'Backed up to Drive ✅', false)
    } catch (e) {
      setErr(e.message === 'no-client-id' ? 'پہلے گوگل Client ID شامل کریں' : 'گوگل بیک اپ ناکام — دوبارہ کوشش کریں')
    } finally { setGBusy(false) }
  }

  async function driveRestore() {
    setGBusy(true); setErr('')
    try {
      const data = JSON.parse(await downloadBackup())
      if (!data.animals) throw new Error('bad')
      importData(data)
      show(lang === 'ur' ? 'گوگل ڈرائیو سے واپس آ گیا ✅' : 'Restored from Drive ✅', false)
    } catch (e) {
      setErr(e.message === 'no-backup' ? 'ڈرائیو پر کوئی بیک اپ نہیں ملا' : 'واپسی ناکام — دوبارہ کوشش کریں')
    } finally { setGBusy(false) }
  }

  // auto-backup every 6h while signed in this session
  useEffect(() => {
    if (isConfigured() && hasToken()) {
      const at = localStorage.getItem(GBACKUP_AT)
      if (!at || Date.now() - new Date(at) > 6 * 3600 * 1000) {
        uploadBackup(JSON.stringify(buildPayload()))
          .then(() => { const now = new Date().toISOString(); localStorage.setItem(GBACKUP_AT, now); setGAt(now) })
          .catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const last = s.lastBackupAt ? new Date(s.lastBackupAt) : null
  const hoursAgo = last ? Math.round((Date.now() - last) / 3600000) : null
  const status =
    !last ? { color: 'bg-danger', icon: '🔴', text: t('backup_never') }
      : hoursAgo > 72 ? { color: 'bg-danger', icon: '🔴', text: `${Math.round(hoursAgo / 24)} دن سے بیک اپ نہیں` }
      : hoursAgo > 12 ? { color: 'bg-warn', icon: '🟡', text: `${hoursAgo} گھنٹے پہلے` }
      : { color: 'bg-ok', icon: '✅', text: `${t('backup_done')} — ${hoursAgo === 0 ? 'ابھی' : hoursAgo + ' گھنٹے پہلے'}` }

  async function exportFile() {
    const seq = (parseInt(localStorage.getItem('dairybook-backup-seq') || '0', 10) || 0) + 1
    const payload = buildPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const res = await shareFile(blob, `DairyBook-backup-${seq}.json`, 'application/json', {
      title: 'DairyBook بیک اپ',
      text: `DairyBook بیک اپ #${seq}`,
    })
    localStorage.setItem('dairybook-backup-seq', String(seq))
    setLastBackup(new Date().toISOString())
    show(
      res === 'downloaded'
        ? `بیک اپ #${seq} محفوظ ہو گیا`
        : `بیک اپ #${seq} تیار — گوگل ڈرائیو منتخب کر کے اپ لوڈ کریں`,
      false,
    )
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
      <div className="px-4 mt-4 space-y-2">
        <button onClick={exportFile} className="gs-btn bg-primary text-white w-full">💾 بیک اپ بنائیں اور گوگل ڈرائیو میں رکھیں</button>
        <label className="gs-btn bg-white text-primary border-2 border-primary/20 w-full cursor-pointer">
          📥 گوگل ڈرائیو سے واپس لائیں
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </label>
        <div className="font-urdu text-xs text-muted text-center leading-relaxed">
          بیک اپ پر «گوگل ڈرائیو» منتخب کریں۔ واپسی پر فائل منتخب کرنے کے لیے گوگل ڈرائیو کھولیں۔
        </div>
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

      {/* google drive backup */}
      <div className="px-4 mt-4">
        <div className="gs-card p-4">
          <div className="font-urdu text-lg font-bold flex items-center gap-2">☁️ گوگل ڈرائیو بیک اپ</div>

          {!gConfigured ? (
            <div className="mt-2">
              <div className="font-urdu text-base text-muted leading-relaxed">
                گوگل بیک اپ کے لیے ایک بار «Google OAuth Client ID» درکار ہے۔ گوگل کلاؤڈ کنسول سے بنا کر یہاں پیسٹ کریں:
              </div>
              <input value={cid} onChange={(e) => setCid(e.target.value)} className="gs-input num mt-2 text-sm" placeholder="xxxx.apps.googleusercontent.com" />
              <button onClick={() => { setClientId(cid); setGConfigured(isConfigured()) }} className="gs-btn bg-primary text-white w-full mt-2">محفوظ کریں</button>
              <div className="font-urdu text-xs text-muted mt-2 leading-relaxed">
                console.cloud.google.com → APIs &amp; Services → Credentials → Create OAuth Client ID (Web) → Authorized JavaScript origin میں ایپ کا پتہ ڈالیں، Drive API آن کریں۔
              </div>
            </div>
          ) : (
            <>
              {gAt && (
                <div className="font-urdu text-sm text-ok mt-1">
                  ✅ آخری ڈرائیو بیک اپ: {(() => { const h = Math.round((Date.now() - new Date(gAt)) / 3600000); return h <= 0 ? 'ابھی' : `${h} گھنٹے پہلے` })()}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={driveBackup} disabled={gBusy} className="gs-btn bg-primary text-white disabled:opacity-50">{gBusy ? '…' : '☁️ ابھی بیک اپ'}</button>
                <button onClick={driveRestore} disabled={gBusy} className="gs-btn bg-white text-primary border-2 border-primary/20 disabled:opacity-50">📥 ڈرائیو سے واپس</button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-urdu text-xs text-muted">خودکار بیک اپ ہر 6 گھنٹے (سائن اِن پر)</span>
                <button onClick={() => setGConfigured(false)} className="font-urdu text-xs text-sky">Client ID تبدیل کریں</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 text-center font-urdu text-sm text-muted">
        💡 ہر فیچر انٹرنیٹ کے بغیر بھی کام کرتا ہے — ڈیٹا آپ کے فون میں محفوظ رہتا ہے
      </div>
    </div>
  )
}
