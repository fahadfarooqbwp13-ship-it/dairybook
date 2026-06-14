import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees } from '../../lib/format.js'
import { shortDate, today } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { EXPENSE_CATS, expenseCat, roleLabel } from '../../lib/domain.js'
import { shareSummary } from '../../lib/summaryImage.js'
import PageHeader from '../../components/PageHeader.jsx'
import NumberPad from '../../components/NumberPad.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function Expenses() {
  const { t, lang } = useT()
  const s = useStore()
  const addExpense = useStore((st) => st.addExpense)
  const paySalary = useStore((st) => st.paySalary)
  const show = useToast((st) => st.show)

  const [cat, setCat] = useState(null) // selected category id when adding
  const [amt, setAmt] = useState('')
  const [note, setNote] = useState('')
  const [sharing, setSharing] = useState(false)

  const byCat = sel.expensesByCategory(s)
  const monthTotal = sel.monthExpenseTotal(s)
  const weekTotal = sel.weekExpenseTotal(s)
  const top = sel.topCategory(s)
  const pie = EXPENSE_CATS.map((c) => ({ name: c.ur, value: byCat[c.id] || 0, color: c.color })).filter((d) => d.value > 0)

  function saveExpense() {
    if (!(+amt > 0)) return
    addExpense(cat, +amt, note.trim())
    show(t('saved_ok'), true)
    setCat(null); setAmt(''); setNote('')
  }

  async function onShare() {
    setSharing(true)
    const rows = EXPENSE_CATS.filter((c) => byCat[c.id]).map((c) => ({ label: c.ur, value: rupees(byCat[c.id]), color: '#B71C1C' }))
    const data = {
      title: 'اخراجات رپورٹ',
      subtitle: `${s.farmName} · اس ماہ`,
      rows,
      highlight: { label: 'کل خرچ', value: rupees(monthTotal), color: '#B71C1C' },
    }
    const r = await shareSummary(data, 'expenses.png')
    setSharing(false)
    if (r === 'downloaded') show(lang === 'ur' ? 'تصویر محفوظ ہو گئی — واٹس ایپ میں خود بھیجیں' : 'Image saved — send it on WhatsApp', false)
  }

  return (
    <div className="pb-8">
      <PageHeader title={t('exp_title')} color="bg-danger" />

      {/* summary */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <Card label={t('exp_thisMonth')} value={rupees(monthTotal)} accent="#B71C1C" />
        <Card label={t('exp_thisWeek')} value={rupees(weekTotal)} accent="#E65100" />
      </div>

      <div className="px-4 mt-3">
        <button onClick={onShare} disabled={sharing} className="gs-btn bg-[#25D366] text-white w-full text-base disabled:opacity-50">
          🟢 {sharing ? 'تصویر بن رہی ہے…' : 'اخراجات رپورٹ بھیجیں (تصویر)'}
        </button>
      </div>

      {/* donut */}
      {pie.length > 0 && (
        <div className="px-4 mt-3">
          <div className="gs-card p-3">
            <div className="flex items-center gap-3">
              <div style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" innerRadius={34} outerRadius={56} paddingAngle={2}>
                      {pie.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                {top && (
                  <div className="font-urdu text-lg">
                    {t('exp_top')}:{' '}
                    <span className="font-bold">{expenseCat(top.cat)[lang]}</span>{' '}
                    <span className="num text-danger">{top.pct}%</span>
                  </div>
                )}
                <div className="mt-2 space-y-1">
                  {pie.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center gap-2 font-urdu text-sm">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }} />
                      <span className="flex-1">{d.name}</span>
                      <span className="num text-muted">{rupees(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* quick add — category icon buttons */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-2">➕ {t('exp_add')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {EXPENSE_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`gs-card flex flex-col items-center gap-1 py-2 ${cat === c.id ? 'ring-2 ring-danger' : ''}`}
            >
              <span style={{ fontSize: 26 }}>{c.icon}</span>
              <span className="font-urdu text-xs leading-tight text-center">{c[lang]}</span>
            </button>
          ))}
        </div>

        {cat && (
          <div className="gs-card p-3 mt-3">
            <div className="font-urdu text-lg text-muted mb-1">{expenseCat(cat)[lang]} — {t('rupees')}</div>
            <div className="num text-3xl font-bold text-danger text-center mb-2">{rupees(+amt || 0)}</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="gs-input font-urdu mb-2" placeholder="تفصیل (اختیاری)" />
            <NumberPad value={amt} onChange={setAmt} allowDecimal={false} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => { setCat(null); setAmt(''); setNote('') }} className="gs-btn bg-white text-muted border-2 border-black/10">{t('cancel')}</button>
              <button onClick={saveExpense} className="gs-btn bg-ok text-white">✅ {t('save')}</button>
            </div>
          </div>
        )}
      </div>

      {/* salaries */}
      <div className="px-4 mt-5">
        <h3 className="font-urdu text-lg font-bold mb-1">👨‍🌾 {t('exp_salaries')}</h3>
        <div className="gs-card p-3 mb-2 flex items-center justify-between">
          <span className="font-urdu text-lg text-muted">{t('exp_payroll')}</span>
          <span className="num text-xl font-bold text-grape">{rupees(sel.monthlyPayroll(s))}</span>
        </div>
        <div className="space-y-2">
          {s.employees.map((e) => {
            const paid = sel.isSalaryPaid(s, e.id)
            return (
              <div key={e.id} className="gs-card p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-urdu text-lg font-bold truncate">{e.name}</div>
                  <div className="font-urdu text-sm text-muted">{roleLabel(e.role, lang)} · <span className="num">{rupees(e.salary)}</span></div>
                </div>
                {paid ? (
                  <span className="font-urdu text-sm bg-ok/15 text-ok rounded-full px-3 py-1 shrink-0">✅ {t('exp_paid')}</span>
                ) : (
                  <button
                    onClick={() => { paySalary(e.id, e.salary); show(t('saved_ok'), true) }}
                    className="gs-btn bg-ok text-white text-base px-3 shrink-0"
                    style={{ minHeight: 44 }}
                  >
                    💵 {t('exp_pay')}
                  </button>
                )}
                <EditBtn collection="employees" id={e.id} />
              </div>
            )
          })}
        </div>
      </div>

      {/* recent expenses */}
      <div className="px-4 mt-5">
        <h3 className="font-urdu text-lg font-bold mb-1">🧾 {t('exp_recent')}</h3>
        <div className="gs-card divide-y divide-black/5">
          {s.expenses.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20).map((e) => {
            const c = expenseCat(e.category)
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-urdu text-base text-ink truncate">{e.note || c[lang]}</div>
                  <div className="font-urdu text-xs text-muted">{shortDate(e.date, lang)} · {c[lang]}</div>
                </div>
                <span className="num text-base font-bold text-danger">{rupees(e.amount)}</span>
                <EditBtn collection="expenses" id={e.id} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Card({ label, value, accent }) {
  return (
    <div className="gs-card p-3" style={{ borderInlineStart: `6px solid ${accent}` }}>
      <div className="font-urdu text-base text-muted">{label}</div>
      <div className="num text-2xl font-bold text-ink">{value}</div>
    </div>
  )
}
