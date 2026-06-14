import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useToast } from '../store/useToast.js'
import { useT } from '../i18n/useT.js'
import { rupees, lnum } from '../lib/format.js'
import * as sel from '../store/selectors.js'
import { animalName } from '../store/selectors.js'
import { shareSummary } from '../lib/summaryImage.js'
import PageHeader from '../components/PageHeader.jsx'
import AnimalAvatar from '../components/AnimalAvatar.jsx'

export default function Profit() {
  const { lang } = useT()
  const s = useStore()
  const show = useToast((st) => st.show)
  const [sharing, setSharing] = useState(false)
  const p = sel.profitOverview(s)

  async function onShare() {
    setSharing(true)
    const data = {
      title: 'منافع رپورٹ',
      subtitle: `${s.farmName} · اس ماہ`,
      rows: [
        { label: 'فروخت قیمت / لیٹر', value: rupees(p.sellRate) },
        { label: 'لاگت / لیٹر', value: rupees(p.costPerLiter), color: '#B71C1C' },
        { label: 'کل آمدن', value: rupees(p.revenue), color: '#2E7D32' },
        { label: 'کل خرچ', value: rupees(p.monthExpense), color: '#B71C1C' },
      ],
      highlight: { label: 'منافع / لیٹر', value: rupees(p.profitPerLiter), color: p.profitPerLiter >= 0 ? '#2E7D32' : '#B71C1C' },
    }
    const r = await shareSummary(data, 'profit.png')
    setSharing(false)
    if (r === 'downloaded') show('تصویر محفوظ ہو گئی — واٹس ایپ میں خود بھیجیں', false)
  }

  return (
    <div className="pb-8">
      <PageHeader title="منافع" color="bg-gold" />

      {/* headline profit per liter */}
      <div className="px-4 mt-3">
        <div className="gs-card p-5 text-center">
          <div className="font-urdu text-lg text-muted">ہر لیٹر پر منافع</div>
          <div className={`num text-5xl font-bold ${p.profitPerLiter >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(p.profitPerLiter)}</div>
          <div className="font-urdu text-base text-muted mt-2">
            فروخت <span className="num">{rupees(p.sellRate)}</span> − لاگت <span className="num">{rupees(p.costPerLiter)}</span>
          </div>
        </div>
      </div>

      {/* totals */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="کل دودھ" value={`${lnum(p.monthMilk)}L`} />
        <Mini label="کل آمدن" value={rupees(p.revenue)} color="text-ok" />
        <Mini label="کل خرچ" value={rupees(p.monthExpense)} color="text-danger" />
      </div>

      <div className="px-4 mt-3">
        <button onClick={onShare} disabled={sharing} className="gs-btn bg-[#25D366] text-white w-full disabled:opacity-50">
          🟢 {sharing ? 'تصویر بن رہی ہے…' : 'منافع رپورٹ بھیجیں (تصویر)'}
        </button>
      </div>

      {/* per-animal profit */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">🐄 فی جانور منافع (اس ماہ)</h3>
        {p.animals.length === 0 ? (
          <div className="gs-card p-3 font-urdu text-muted">اس ماہ دودھ کا ریکارڈ نہیں</div>
        ) : (
          <div className="space-y-2">
            {p.animals.map((r) => (
              <div key={r.animal.id} className="gs-card p-3 flex items-center gap-3">
                <AnimalAvatar animal={r.animal} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="font-urdu text-base font-bold truncate">{animalName(r.animal)}</div>
                  <div className="font-urdu text-sm text-muted"><span className="num">{lnum(r.liters)}L</span> · آمدن <span className="num">{rupees(r.revenue)}</span></div>
                </div>
                <div className="text-end shrink-0">
                  <div className={`num text-lg font-bold ${r.profit >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(r.profit)}</div>
                  <div className="text-base">{r.profit >= 0 ? '🟢' : '🔴'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-3 font-urdu text-xs text-muted leading-relaxed">
        ℹ️ لاگت فی لیٹر = اس ماہ کے کل اخراجات ÷ کل دودھ۔ ہر جانور کا منافع اس کے دودھ کے حساب سے نکالا گیا ہے۔
      </div>
    </div>
  )
}

function Mini({ label, value, color = 'text-ink' }) {
  return (
    <div className="gs-card p-2">
      <div className={`num text-base font-bold ${color}`}>{value}</div>
      <div className="font-urdu text-xs text-muted">{label}</div>
    </div>
  )
}
