import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useToast } from '../store/useToast.js'
import { useConfirm } from '../store/useEditor.js'
import { useT } from '../i18n/useT.js'
import PageHeader from '../components/PageHeader.jsx'

const MODULES = [
  { icon: '🥛', to: '/milk', label: { ur: 'دودھ ریکارڈ', en: 'Milk' } },
  { icon: '💰', to: '/buyers', label: { ur: 'خریدار اور فروخت', en: 'Buyers & sales' } },
  { icon: '🧾', to: '/expenses', label: { ur: 'اخراجات', en: 'Expenses' } },
  { icon: '📊', to: '/reports', label: { ur: 'رپورٹیں', en: 'Reports' } },
  { icon: '🐄', to: '/animals', label: { ur: 'جانور رجسٹر', en: 'Animals' } },
  { icon: '🍼', to: '/breeding', label: { ur: 'افزائش نسل', en: 'Breeding' } },
  { icon: '💊', to: '/health', label: { ur: 'صحت اور ٹیکے', en: 'Health & vaccines' } },
  { icon: '📅', to: '/calendar', label: { ur: 'کیلنڈر', en: 'Calendar' } },
  { icon: '🌤️', to: '/weather', label: { ur: 'موسم', en: 'Weather' } },
  { icon: '🛒', to: '/trade', label: { ur: 'خرید و فروخت', en: 'Buy & sell' } },
  { icon: '☁️', to: '/backup', label: { ur: 'بیک اپ', en: 'Backup' } },
]

export default function More() {
  const nav = useNavigate()
  const { t, lang } = useT()
  const toggleLang = useStore((s) => s.toggleLang)
  const resetDemo = useStore((s) => s.resetDemo)
  const newFarm = useStore((s) => s.newFarm)
  const clearAnimals = useStore((s) => s.clearAnimals)
  const farmName = useStore((s) => s.farmName)
  const binCount = useStore((s) => (s.recycleBin || []).length)
  const show = useToast((s) => s.show)
  const confirm = useConfirm((s) => s.confirm)

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
        <div className="gs-card p-4 flex items-center justify-between">
          <span className="font-urdu text-lg">🏡 {farmName}</span>
        </div>
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
        <button
          onClick={() => {
            resetDemo()
            show(lang === 'ur' ? 'ڈیمو ڈیٹا دوبارہ لوڈ ہو گیا' : 'Demo data reloaded')
          }}
          className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]"
        >
          <span className="font-urdu text-lg">🔄 ڈیمو ڈیٹا ری سیٹ کریں</span>
        </button>
      </div>

      {/* all modules */}
      <div className="px-4 mt-5">
        <h2 className="font-urdu text-xl font-bold text-ink mb-2">تمام ماڈیولز</h2>
        <div className="space-y-2">
          {MODULES.map((m, i) => (
            <button key={i} onClick={() => nav(m.to)} className="gs-card w-full p-4 flex items-center justify-between active:scale-[0.99]">
              <span className="font-urdu text-lg flex items-center gap-3">
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                {m.label[lang]}
              </span>
              <span className="text-2xl text-muted">›</span>
            </button>
          ))}
        </div>
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
        ڈیری بک — تمام 11 ماڈیولز
      </div>
    </div>
  )
}
