import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useToast } from '../store/useToast.js'
import { useConfirm } from '../store/useEditor.js'
import { useT } from '../i18n/useT.js'
import PageHeader from '../components/PageHeader.jsx'

export default function More() {
  const nav = useNavigate()
  const { t, lang } = useT()
  const toggleLang = useStore((s) => s.toggleLang)
  const resetDemo = useStore((s) => s.resetDemo)
  const newFarm = useStore((s) => s.newFarm)
  const clearAnimals = useStore((s) => s.clearAnimals)
  const farmName = useStore((s) => s.farmName)
  const ownerName = useStore((s) => s.ownerName)
  const setFarm = useStore((s) => s.setFarm)
  const binCount = useStore((s) => (s.recycleBin || []).length)
  const show = useToast((s) => s.show)
  const confirm = useConfirm((s) => s.confirm)
  const [editName, setEditName] = useState(null) // farm-name draft when editing

  function saveFarmName() {
    const name = (editName || '').trim()
    if (name) setFarm(name, ownerName)
    setEditName(null)
    show(t('saved_ok'), false)
  }

  async function doNewFarm() {
    const ok = await confirm({
      title: lang === 'ur' ? 'نیا فارم شروع کریں؟' : 'Start a new farm?',
      message: lang === 'ur'
        ? 'تمام جانور، خریدار، حساب کتاب اور ریکارڈ مٹ جائیں گے۔ پہلے بیک اپ محفوظ کرنا نہ بھولیں!'
        : 'All animals, buyers and records will be wiped. Save a backup first!',
      confirmLabel: lang === 'ur' ? 'سب مٹا دیں' : 'Wipe everything',
      danger: true,
      requireText: 'DELETE',
    })
    if (ok) {
      newFarm()
      show(lang === 'ur' ? 'نیا فارم تیار ہے ✅' : 'New farm ready ✅', false)
      nav('/')
    }
  }

  async function doResetDemo() {
    const ok = await confirm({
      title: lang === 'ur' ? 'ڈیمو ڈیٹا لوڈ کریں؟' : 'Load demo data?',
      message: lang === 'ur'
        ? 'آپ کا موجودہ سارا ڈیٹا ہٹ کر نمونہ (ڈیمو) ڈیٹا آ جائے گا۔ پہلے بیک اپ لے لیں!'
        : 'Your current data will be replaced with sample demo data. Back up first!',
      confirmLabel: lang === 'ur' ? 'ڈیمو لوڈ کریں' : 'Load demo',
      danger: true,
    })
    if (ok) {
      resetDemo()
      show(lang === 'ur' ? 'ڈیمو ڈیٹا دوبارہ لوڈ ہو گیا' : 'Demo data reloaded')
    }
  }

  async function doClearAnimals() {
    const ok = await confirm({
      title: lang === 'ur' ? 'صرف جانور صاف کریں؟' : 'Clear animals only?',
      message: lang === 'ur'
        ? 'جانور، دودھ ریکارڈ، افزائش اور صحت کے ریکارڈ مٹ جائیں گے۔ خریدار اور ملازم محفوظ رہیں گے۔'
        : 'Animals, milk, breeding & health records wiped. Buyers & employees kept.',
      confirmLabel: lang === 'ur' ? 'جانور صاف کریں' : 'Clear animals',
      danger: true,
    })
    if (ok) {
      clearAnimals()
      show(t('saved_ok'), true)
    }
  }

  return (
    <div className="pb-8">
      <PageHeader title={t('nav_more')} color="bg-grape" />

      {/* settings */}
      <div className="px-4 mt-4 space-y-2">
        {editName === null ? (
          <div className="gs-card p-4 flex items-center justify-between gap-2">
            <span className="font-urdu text-lg flex-1 min-w-0 truncate">🏡 {farmName}</span>
            <button onClick={() => setEditName(farmName)} className="gs-touch rounded-full flex items-center justify-center text-primary shrink-0" style={{ width: 44, height: 44 }} aria-label="edit farm name">
              ✏️
            </button>
          </div>
        ) : (
          <div className="gs-card p-3">
            <div className="font-urdu text-base text-muted mb-1">🏡 فارم کا نام</div>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="gs-input font-urdu"
              placeholder="فارم کا نام"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => setEditName(null)} className="gs-btn bg-white text-muted border-2 border-black/10">{t('cancel')}</button>
              <button onClick={saveFarmName} className="gs-btn bg-ok text-white">✅ {t('save')}</button>
            </div>
          </div>
        )}
        <button onClick={toggleLang} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <span className="font-urdu text-lg">🌐 زبان / Language</span>
          <span className="font-bold text-primary">{lang === 'ur' ? 'اردو' : 'English'}</span>
        </button>
        <button onClick={() => nav('/backup')} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <span className="font-urdu text-lg">☁️ بیک اپ اور واپسی</span>
          <span className="text-2xl text-muted">›</span>
        </button>
        <button onClick={() => nav('/recycle-bin')} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <span className="font-urdu text-lg">🗑️ ردی کی ٹوکری</span>
          <span className="flex items-center gap-2">
            {binCount > 0 && <span className="num text-sm bg-cream text-muted rounded-full px-2 py-0.5">{binCount}</span>}
            <span className="text-2xl text-muted">›</span>
          </span>
        </button>
        <button onClick={doResetDemo} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
          <span className="font-urdu text-lg">🔄 ڈیمو ڈیٹا ری سیٹ کریں</span>
        </button>
      </div>

      {/* danger zone */}
      <div className="px-4 mt-5">
        <h2 className="font-urdu text-xl font-bold text-danger mb-2">⚠️ خطرناک زون</h2>
        <div className="rounded-card border-2 border-danger/30 overflow-hidden divide-y divide-danger/15">
          <button onClick={doNewFarm} className="w-full p-4 bg-surface text-start active:bg-danger/5">
            <div className="font-urdu text-lg font-bold text-danger">🆕 نیا فارم شروع کریں</div>
            <div className="font-urdu text-sm text-muted leading-snug">سب کچھ مٹا کر نئے سرے سے شروع کریں (نیا مالک / نیا سیزن)</div>
          </button>
          <button onClick={doClearAnimals} className="w-full p-4 bg-surface text-start active:bg-danger/5">
            <div className="font-urdu text-lg font-bold text-accent">🐄 صرف جانور صاف کریں</div>
            <div className="font-urdu text-sm text-muted leading-snug">جانور اور ان کے ریکارڈ مٹائیں — خریدار اور ملازم محفوظ رہیں</div>
          </button>
          <button onClick={() => nav('/backup')} className="w-full p-4 bg-surface text-start active:bg-danger/5">
            <div className="font-urdu text-lg font-bold text-primary">📥 بیک اپ سے واپس لائیں</div>
            <div className="font-urdu text-sm text-muted leading-snug">پرانی محفوظ شدہ فائل سے سارا ڈیٹا واپس لائیں</div>
          </button>
        </div>
      </div>

      <div className="px-4 mt-6 text-center font-urdu text-sm text-muted">
        ڈیری بک · ترتیبات
      </div>
    </div>
  )
}
