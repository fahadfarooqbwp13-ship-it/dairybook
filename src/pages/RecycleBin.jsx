import { useStore } from '../store/useStore.js'
import { useToast } from '../store/useToast.js'
import { useConfirm } from '../store/useEditor.js'
import { useT } from '../i18n/useT.js'
import { rupees, liters } from '../lib/format.js'
import { shortDate } from '../lib/date.js'
import { animalName, findAnimal } from '../store/selectors.js'
import { expenseCat, vaccineLabel } from '../lib/domain.js'
import PageHeader from '../components/PageHeader.jsx'

const ICON = {
  animals: '🐄', milkLogs: '🥛', bulkMilk: '🥛', buyers: '💰', deliveries: '📦',
  payments: '💵', expenses: '🧾', employees: '👨‍🌾', salaryPayments: '💵',
  breedingEvents: '🍼', vaccinations: '💉', healthEvents: '🩺', medicines: '💊', transactions: '🛒',
}

function label(item, s, lang) {
  const r = item.record
  const an = (id) => animalName(findAnimal(s, id))
  switch (item.collection) {
    case 'animals': return `${r.name || 'نمبر ' + r.tag} (${r.breed || '—'})`
    case 'milkLogs': return `${an(r.animalId)} — ${liters((r.morning || 0) + (r.evening || 0))} · ${shortDate(r.date, lang)}`
    case 'bulkMilk': return `کل دودھ ${liters((r.morning || 0) + (r.evening || 0))} · ${shortDate(r.date, lang)}`
    case 'buyers': return r.name
    case 'deliveries': return `${liters(r.liters)} · ${rupees(r.amount)} · ${shortDate(r.date, lang)}`
    case 'payments': return `${rupees(r.amount)} · ${shortDate(r.date, lang)}`
    case 'expenses': return `${expenseCat(r.category)[lang]} ${rupees(r.amount)}`
    case 'employees': return r.name
    case 'salaryPayments': return `تنخواہ ${rupees(r.amount)}`
    case 'breedingEvents': return `${an(r.animalId)} — ${r.type}`
    case 'vaccinations': return `${an(r.animalId)} — ${vaccineLabel(r.vaccine, lang)}`
    case 'healthEvents': return `${an(r.animalId)} — ${r.diagnosis || 'صحت'}`
    case 'medicines': return `${r.name} ×${r.qty}`
    case 'transactions': return `${r.type === 'buy' ? 'خرید' : 'فروخت'} ${rupees(r.price)}`
    default: return item.collection
  }
}

function daysAgo(iso) {
  return Math.floor((Date.now() - new Date(iso)) / 86400000)
}

export default function RecycleBin() {
  const { t, lang } = useT()
  const s = useStore()
  const restoreRecord = useStore((st) => st.restoreRecord)
  const permanentDelete = useStore((st) => st.permanentDelete)
  const emptyRecycleBin = useStore((st) => st.emptyRecycleBin)
  const show = useToast((st) => st.show)
  const confirm = useConfirm((st) => st.confirm)

  const bin = s.recycleBin || []

  async function purge(item) {
    const ok = await confirm({
      title: lang === 'ur' ? 'مستقل حذف کریں؟' : 'Delete permanently?',
      message: lang === 'ur' ? 'یہ ریکارڈ ہمیشہ کے لیے ختم ہو جائے گا — واپس نہیں آ سکتا۔' : 'This cannot be undone.',
      confirmLabel: lang === 'ur' ? 'مستقل حذف' : 'Delete forever',
      danger: true,
    })
    if (ok) permanentDelete(item.binId)
  }

  async function purgeAll() {
    const ok = await confirm({
      title: lang === 'ur' ? 'ٹوکری خالی کریں؟' : 'Empty recycle bin?',
      message: lang === 'ur' ? `${bin.length} ریکارڈ ہمیشہ کے لیے ختم ہو جائیں گے۔` : `${bin.length} records will be gone forever.`,
      confirmLabel: lang === 'ur' ? 'سب حذف' : 'Delete all',
      danger: true,
    })
    if (ok) emptyRecycleBin()
  }

  return (
    <div className="pb-8">
      <PageHeader title={lang === 'ur' ? 'ردی کی ٹوکری' : 'Recycle bin'} color="bg-[#5D4037]" />

      <div className="px-4 mt-3">
        <div className="gs-card p-3 font-urdu text-base text-muted leading-relaxed">
          🗑️ حذف کیے گئے ریکارڈ یہاں محفوظ رہتے ہیں۔ غلطی سے حذف ہونے پر واپس لائیں۔ کوئی چیز خود بخود ہمیشہ کے لیے ختم نہیں ہوتی۔
        </div>
      </div>

      {bin.length === 0 ? (
        <div className="px-4 mt-6 text-center font-urdu text-lg text-muted">ٹوکری خالی ہے ✅</div>
      ) : (
        <>
          <div className="px-4 mt-3 space-y-2">
            {bin.map((item) => (
              <div key={item.binId} className="gs-card p-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 22 }}>{ICON[item.collection] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-urdu text-base font-bold text-ink break-words leading-snug">{label(item, s, lang)}</div>
                    <div className="font-urdu text-xs text-muted">
                      {daysAgo(item.deletedAt) === 0 ? 'آج حذف' : `${daysAgo(item.deletedAt)} دن پہلے حذف`}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => { restoreRecord(item.binId); show(lang === 'ur' ? 'واپس آ گیا ✅' : 'Restored ✅', false) }}
                    className="gs-btn bg-ok text-white text-base"
                    style={{ minHeight: 44 }}
                  >
                    ↩️ {lang === 'ur' ? 'واپس لائیں' : 'Restore'}
                  </button>
                  <button onClick={() => purge(item)} className="gs-btn bg-white text-danger border-2 border-danger/30 text-base" style={{ minHeight: 44 }}>
                    🗑️ {lang === 'ur' ? 'مستقل حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 mt-4">
            <button onClick={purgeAll} className="gs-btn bg-danger text-white w-full">🗑️ {lang === 'ur' ? 'ٹوکری خالی کریں' : 'Empty bin'}</button>
          </div>
        </>
      )}
    </div>
  )
}
