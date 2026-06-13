import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { useToast } from '../../store/useToast.js'
import { useT } from '../../i18n/useT.js'
import { rupees, num } from '../../lib/format.js'
import { shortDate } from '../../lib/date.js'
import * as sel from '../../store/selectors.js'
import { animalName } from '../../store/selectors.js'
import PageHeader from '../../components/PageHeader.jsx'
import EditBtn from '../../components/EditBtn.jsx'

export default function Trade() {
  const { t, lang } = useT()
  const s = useStore()
  const addPurchase = useStore((st) => st.addPurchase)
  const addSale = useStore((st) => st.addSale)
  const show = useToast((st) => st.show)
  const [mode, setMode] = useState(null) // 'buy' | 'sell' | null

  const spent = sel.yearSpent(s)
  const earned = sel.yearEarned(s)
  const txs = s.transactions.slice().sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="pb-8">
      <PageHeader title={t('trade_title')} color="bg-[#7B1F1F]" />

      {/* summary */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <Card label={t('trade_spent')} value={rupees(spent)} accent="#B71C1C" />
        <Card label={t('trade_earned')} value={rupees(earned)} accent="#2E7D32" />
      </div>

      {/* add buttons */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => setMode(mode === 'buy' ? null : 'buy')} className="gs-btn bg-primary text-white">🐄 {t('trade_addBuy')}</button>
        <button onClick={() => setMode(mode === 'sell' ? null : 'sell')} className="gs-btn bg-gold text-ink">💰 {t('trade_addSell')}</button>
      </div>

      {mode === 'buy' && <BuyForm addPurchase={addPurchase} show={show} t={t} onDone={() => setMode(null)} />}
      {mode === 'sell' && <SellForm s={s} addSale={addSale} show={show} t={t} onDone={() => setMode(null)} />}

      {/* log */}
      <div className="px-4 mt-4">
        <h3 className="font-urdu text-lg font-bold mb-1">📜 ریکارڈ</h3>
        <div className="gs-card divide-y divide-black/5">
          {txs.map((tx) => {
            const a = tx.animalId ? sel.findAnimal(s, tx.animalId) : null
            const prof = tx.type === 'sell' && tx.animalId ? sel.animalProfit(s, tx.animalId) : null
            return (
              <div key={tx.id} className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-urdu text-base font-bold flex-1 min-w-0 truncate">
                    {tx.type === 'buy' ? '🐄 ' + t('trade_buy') : '💰 ' + t('trade_sell')}{a ? ` — ${animalName(a)}` : ''}
                  </span>
                  <span className={`num text-base font-bold shrink-0 ${tx.type === 'buy' ? 'text-danger' : 'text-ok'}`}>{rupees(tx.price)}</span>
                  <EditBtn collection="transactions" id={tx.id} />
                </div>
                <div className="font-urdu text-xs text-muted mt-0.5">
                  {shortDate(tx.date, lang)} · {tx.counterparty}{tx.notes ? ` · ${tx.notes}` : ''}
                </div>
                {prof && (
                  <div className="font-urdu text-sm mt-1">
                    منافع: <span className={`num font-bold ${prof.profit >= 0 ? 'text-ok' : 'text-danger'}`}>{rupees(prof.profit)}</span>
                    <span className="text-muted text-xs num"> (خرید {rupees(prof.buy)} + خرچ {rupees(prof.care)})</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BuyForm({ addPurchase, show, t, onDone }) {
  const [f, setF] = useState({ tag: '', species: 'cow', breed: '', price: '', weight: '', counterparty: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  return (
    <div className="px-4 mt-3">
      <div className="gs-card p-3 space-y-2">
        <input className="gs-input num" inputMode="numeric" placeholder={t('animals_tag')} value={f.tag} onChange={set('tag')} />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setF({ ...f, species: 'cow' })} className={`gs-btn ${f.species === 'cow' ? 'bg-primary text-white' : 'bg-white text-muted border-2 border-black/10'}`}>🐄 گائے</button>
          <button onClick={() => setF({ ...f, species: 'buffalo' })} className={`gs-btn ${f.species === 'buffalo' ? 'bg-primary text-white' : 'bg-white text-muted border-2 border-black/10'}`}>🐃 بھینس</button>
        </div>
        <input className="gs-input font-urdu" placeholder={t('animals_breed')} value={f.breed} onChange={set('breed')} />
        <div className="grid grid-cols-2 gap-2">
          <input className="gs-input num" inputMode="numeric" placeholder="قیمت ₨" value={f.price} onChange={set('price')} />
          <input className="gs-input num" inputMode="numeric" placeholder="وزن kg" value={f.weight} onChange={set('weight')} />
        </div>
        <input className="gs-input font-urdu" placeholder="بیچنے والا / منڈی" value={f.counterparty} onChange={set('counterparty')} />
        <button
          onClick={() => { if (+f.price > 0) { addPurchase(f); show(t('saved_ok'), true); onDone() } }}
          className="gs-btn bg-ok text-white w-full"
        >✅ {t('save')}</button>
      </div>
    </div>
  )
}

function SellForm({ s, addSale, show, t, onDone }) {
  const sellable = s.animals.filter((a) => a.status !== 'sold' && a.status !== 'dead')
  const [animalId, setAnimalId] = useState(sellable[0]?.id || '')
  const [f, setF] = useState({ price: '', counterparty: '' })
  return (
    <div className="px-4 mt-3">
      <div className="gs-card p-3 space-y-2">
        <select className="gs-input font-urdu" value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
          {sellable.map((a) => <option key={a.id} value={a.id}>{animalName(a)} ({a.breed})</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input className="gs-input num" inputMode="numeric" placeholder="فروخت قیمت ₨" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <input className="gs-input font-urdu" placeholder="خریدار" value={f.counterparty} onChange={(e) => setF({ ...f, counterparty: e.target.value })} />
        </div>
        <button
          onClick={() => { if (animalId && +f.price > 0) { addSale(animalId, f); show(t('saved_ok'), true); onDone() } }}
          className="gs-btn bg-ok text-white w-full"
        >✅ {t('save')}</button>
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
