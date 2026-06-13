import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { useStore } from '../../store/useStore.js'
import { useT } from '../../i18n/useT.js'
import { rupees, liters, num } from '../../lib/format.js'
import { shortDate } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { animalName } from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'

const waLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`

export default function Reports() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const s = useStore()
  const [tab, setTab] = useState('weekly')

  const wk = sel.weekStats(s, 0)
  const wkPrev = sel.weekStats(s, 1)
  const mo = sel.monthStats(s, 0)
  const fc = sel.milkForecast(s, 30)

  const cur = tab === 'monthly' ? mo : wk
  const period = tab === 'monthly' ? `${shortDate(mo.start, lang)} – ${shortDate(mo.end, lang)}` : `${shortDate(wk.start, lang)} – ${shortDate(wk.end, lang)}`
  const milkDelta = wkPrev.milk > 0 ? Math.round(((wk.milk - wkPrev.milk) / wkPrev.milk) * 100) : 0
  const margin = cur.expense > 0 ? (cur.revenue / cur.expense).toFixed(2) : '—'

  const barData = [
    { name: lang === 'ur' ? 'آمدن' : 'Revenue', v: cur.revenue, color: '#2E7D32' },
    { name: lang === 'ur' ? 'اخراجات' : 'Expense', v: cur.expense, color: '#B71C1C' },
  ]

  const shareText =
    `${s.farmName} — ${tab === 'monthly' ? t('rep_monthly') : t('rep_weekly')} رپورٹ\n` +
    `${period}\n${t('rep_milk')}: ${num(cur.milk)}L\n${t('rep_revenue')}: ${rupees(cur.revenue)}\n` +
    `${t('rep_expense')}: ${rupees(cur.expense)}\n${t('rep_profit')}: ${rupees(cur.profit)}`

  return (
    <div className="pb-8">
      <PageHeader title={t('rep_title')} color="bg-grape" />

      {/* tabs */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {[['weekly', t('rep_weekly')], ['monthly', t('rep_monthly')], ['predict', t('rep_predict')]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-card font-urdu text-lg ${tab === k ? 'bg-grape text-white' : 'bg-white text-muted'}`}
            style={{ minHeight: 48 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* jump to any day's full record */}
      <div className="px-4 mt-2">
        <button onClick={() => nav('/day')} className="gs-btn bg-white text-grape border-2 border-grape/20 w-full text-base">
          📅 تاریخ سے دیکھیں — دن کا ریکارڈ
        </button>
      </div>

      {tab !== 'predict' ? (
        <div className="px-4 mt-3 space-y-3">
          <div className="font-urdu text-base text-muted text-center">{period}</div>

          {/* net profit hero */}
          <div className="gs-card p-5 text-center">
            <div className="font-urdu text-lg text-muted">{t('rep_profit')}</div>
            <div className={`num text-5xl font-bold ${cur.profit >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(cur.profit)}</div>
            {tab === 'weekly' && (
              <div className="font-urdu text-sm text-muted mt-1">
                پچھلے ہفتے سے دودھ <span className={`num ${milkDelta >= 0 ? 'text-ok' : 'text-danger'}`}>{milkDelta >= 0 ? '↑' : '↓'} {Math.abs(milkDelta)}%</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label={t('rep_milk')} value={liters(cur.milk)} />
            <Stat label={t('rep_revenue')} value={rupees(cur.revenue)} />
            <Stat label={t('rep_expense')} value={rupees(cur.expense)} />
          </div>

          {/* revenue vs expense */}
          <div className="gs-card p-2" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 16, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 13, fontFamily: 'Noto Nastaliq Urdu' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => rupees(v)} labelFormatter={() => ''} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="gs-card p-3 flex items-center justify-between">
            <span className="font-urdu text-lg text-muted">منافع کا تناسب (₨1 پر)</span>
            <span className="num text-xl font-bold text-grape">₨{margin}</span>
          </div>

          {cur.bestAnimal && (
            <div className="gs-card p-3 flex items-center gap-3">
              <span style={{ fontSize: 28 }}>{cur.bestAnimal.emoji}</span>
              <div className="flex-1">
                <div className="font-urdu text-base text-muted">{t('rep_best')}</div>
                <div className="font-urdu text-lg font-bold">{animalName(cur.bestAnimal)}</div>
              </div>
            </div>
          )}

          <a href={waLink(shareText)} className="gs-btn bg-[#25D366] text-white w-full">🟢 {t('rep_share')}</a>
        </div>
      ) : (
        <div className="px-4 mt-3 space-y-3">
          <div className="gs-card p-5 text-center">
            <div className="font-urdu text-lg text-muted">{t('rep_nextMonth')}</div>
            <div className="num text-4xl font-bold text-sky">{liters(fc.next30)}</div>
            <div className="font-urdu text-base mt-1">
              رجحان: <span className={fc.trendUp ? 'text-ok' : 'text-danger'}>{fc.trendUp ? '↑ بڑھ رہا ہے' : '↓ کم ہو رہا ہے'}</span>
            </div>
          </div>
          <div className="gs-card p-4 font-urdu text-lg leading-loose">
            {fc.trendUp
              ? '📈 دودھ کی پیداوار بڑھ رہی ہے۔ خوراک اور خریدار کی منصوبہ بندی ابھی سے بڑھائیں۔'
              : '📉 دودھ کم ہو رہا ہے۔ خوراک، صحت اور گرمی کے اثرات چیک کریں۔'}
          </div>
          <div className="gs-card p-4 font-urdu text-base text-muted leading-loose">
            ℹ️ یہ پیشگوئی پچھلے 30 دن کے دودھ کے رجحان (لکیری تخمینہ) پر مبنی ہے۔ جتنا زیادہ ڈیٹا، اتنی بہتر پیشگوئی۔
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="gs-card p-2 text-center">
      <div className="num text-lg font-bold text-ink">{value}</div>
      <div className="font-urdu text-xs text-muted leading-tight mt-0.5">{label}</div>
    </div>
  )
}
