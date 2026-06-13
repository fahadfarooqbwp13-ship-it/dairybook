// Pure derived-data helpers over the store state. Keeping them out of the
// store keeps the persisted shape small and the math easy to test/read.
import { today, addDays, daysBetween, monthName, shortDate } from '../lib/date.js'
import { vaccineLabel, symptomLabel, expenseCat } from '../lib/domain.js'

export const animalName = (a) => (a ? a.name || 'نمبر ' + a.tag : '—')
export const findAnimal = (s, id) => s.animals.find((a) => a.id === id)

// ---------- milk ----------
export const isMilker = (a) => a.sex === 'f' && (a.status === 'active' || a.status === 'pregnant')
export const milkers = (s) => s.animals.filter(isMilker)

export const logFor = (s, animalId, date) =>
  s.milkLogs.find((m) => m.animalId === animalId && m.date === date) || null

export const animalDayMilk = (s, animalId, date) => {
  const l = logFor(s, animalId, date)
  return l ? (l.morning || 0) + (l.evening || 0) : 0
}

export const bulkFor = (s, date) => (s.bulkMilk || []).find((b) => b.date === date) || null
export const dayBulkMilk = (s, date = today()) => {
  const b = bulkFor(s, date)
  return b ? (b.morning || 0) + (b.evening || 0) : 0
}
export const dayMilkTotal = (s, date = today()) => {
  const perAnimal = s.milkLogs
    .filter((m) => m.date === date)
    .reduce((t, m) => t + (m.morning || 0) + (m.evening || 0), 0)
  return perAnimal + dayBulkMilk(s, date)
}

export const todayMilk = (s) => dayMilkTotal(s, today())

// liters for last `days` days as [{date, liters, morning, evening}]
export function animalSeries(s, animalId, days) {
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today(), -i)
    const l = logFor(s, animalId, date)
    out.push({
      date,
      morning: l ? l.morning || 0 : 0,
      evening: l ? l.evening || 0 : 0,
      liters: l ? (l.morning || 0) + (l.evening || 0) : 0,
    })
  }
  return out
}

export function animalStats(s, animalId) {
  const s30 = animalSeries(s, animalId, 30)
  const withMilk = s30.filter((d) => d.liters > 0)
  const monthTotal = s30.reduce((t, d) => t + d.liters, 0)
  const avg = withMilk.length ? monthTotal / withMilk.length : 0
  const peak = s30.reduce((p, d) => (d.liters > p.liters ? d : p), { liters: 0, date: null })
  const todayL = animalDayMilk(s, animalId, today())
  // trend: last 15 days vs the 15 before
  const recent = s30.slice(15).reduce((t, d) => t + d.liters, 0) / 15
  const prior = s30.slice(0, 15).reduce((t, d) => t + d.liters, 0) / 15
  const trendPct = prior > 0 ? ((recent - prior) / prior) * 100 : 0
  return { monthTotal, avg, peak, todayL, trendPct }
}

// herd ranking for a given day, tagged vs herd average
export function herdDay(s, date = today()) {
  const rows = milkers(s).map((a) => ({ animal: a, liters: animalDayMilk(s, a.id, date) }))
  const producing = rows.filter((r) => r.liters > 0)
  const avg = producing.length ? producing.reduce((t, r) => t + r.liters, 0) / producing.length : 0
  rows.forEach((r) => {
    if (avg === 0) r.band = 'avg'
    else if (r.liters >= avg * 1.1) r.band = 'high'
    else if (r.liters <= avg * 0.9) r.band = 'low'
    else r.band = 'avg'
  })
  rows.sort((a, b) => b.liters - a.liters)
  return { rows, avg, total: rows.reduce((t, r) => t + r.liters, 0) }
}

// ---------- buyers ----------
export const buyerDeliveries = (s, buyerId) => s.deliveries.filter((d) => d.buyerId === buyerId)
export const buyerPayments = (s, buyerId) => s.payments.filter((p) => p.buyerId === buyerId)

export const buyerBilled = (s, buyerId) =>
  buyerDeliveries(s, buyerId).reduce((t, d) => t + d.amount, 0)
export const buyerPaid = (s, buyerId) =>
  buyerPayments(s, buyerId).reduce((t, p) => t + p.amount, 0)
export const buyerBalance = (s, buyerId) => buyerBilled(s, buyerId) - buyerPaid(s, buyerId)

export function buyerLastPayment(s, buyerId) {
  const ps = buyerPayments(s, buyerId)
  if (!ps.length) return null
  return ps.reduce((m, p) => (p.date > m ? p.date : m), ps[0].date)
}

export function buyerDue(s, buyer) {
  const balance = buyerBalance(s, buyer.id)
  const lastPay = buyerLastPayment(s, buyer.id)
  const ref = lastPay || buyer.createdAt || today()
  const daysSince = daysBetween(ref, today())
  let status = 'ok'
  if (balance > 0) {
    if (daysSince > buyer.cycleDays) status = 'overdue'
    else if (daysSince >= buyer.cycleDays - 3) status = 'soon'
  }
  return { balance, lastPay, daysSince, status }
}

export const totalReceivable = (s) =>
  s.buyers.reduce((t, b) => t + Math.max(0, buyerBalance(s, b.id)), 0)

// ---------- monthly bills ----------
// Full bill data for one buyer + month (rows, totals, received, running balance).
export function buyerMonthBill(s, buyerId, year, month, lang = 'ur') {
  const mk = `${year}-${String(month + 1).padStart(2, '0')}`
  const rows = s.deliveries
    .filter((d) => d.buyerId === buyerId && d.date.startsWith(mk))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((d) => ({ date: shortDate(d.date, lang), liters: d.liters, rate: d.rate, amount: d.amount }))
  const totalLiters = s.deliveries.filter((d) => d.buyerId === buyerId && d.date.startsWith(mk)).reduce((t, d) => t + d.liters, 0)
  const totalAmount = s.deliveries.filter((d) => d.buyerId === buyerId && d.date.startsWith(mk)).reduce((t, d) => t + d.amount, 0)
  const received = s.payments.filter((p) => p.buyerId === buyerId && p.date.startsWith(mk)).reduce((t, p) => t + p.amount, 0)
  const endOfMonth = `${mk}-31`
  const billed = s.deliveries.filter((d) => d.buyerId === buyerId && d.date <= endOfMonth).reduce((t, d) => t + d.amount, 0)
  const paid = s.payments.filter((p) => p.buyerId === buyerId && p.date <= endOfMonth).reduce((t, p) => t + p.amount, 0)
  return { rows, totalLiters, totalAmount, received, balance: billed - paid, monthLabel: `${monthName(month, lang)} ${year}` }
}

// List of months that have deliveries for a buyer (newest first) — drives the
// "past bills" history. Balance status is the running balance as of each month.
export function buyerMonthlyBills(s, buyerId, lang = 'ur') {
  const seen = {}
  s.deliveries
    .filter((d) => d.buyerId === buyerId)
    .forEach((d) => {
      const y = +d.date.slice(0, 4)
      const m = +d.date.slice(5, 7) - 1
      seen[`${y}-${m}`] = { year: y, month: m }
    })
  return Object.values(seen)
    .map(({ year, month }) => {
      const b = buyerMonthBill(s, buyerId, year, month, lang)
      return { year, month, monthLabel: b.monthLabel, totalLiters: b.totalLiters, totalAmount: b.totalAmount, balance: b.balance, paid: b.balance <= 0 }
    })
    .sort((a, b) => b.year - a.year || b.month - a.month)
}

// ---------- alerts ----------
export function buildAlerts(s) {
  const alerts = []

  // overdue / soon buyer payments
  s.buyers.forEach((b) => {
    const due = buyerDue(s, b)
    if (due.status === 'overdue') {
      alerts.push({
        id: 'pay_' + b.id,
        level: 'red',
        icon: '🔴',
        text: `${b.name} کا حساب ${due.daysSince} دن سے باقی ہے`,
        amount: due.balance,
        action: { type: 'call', phone: b.phone, label: b.name },
        to: `/buyers/${b.id}`,
      })
    } else if (due.status === 'soon') {
      alerts.push({
        id: 'pay_' + b.id,
        level: 'yellow',
        icon: '🟡',
        text: `${b.name} کا حساب جلد ہوگا`,
        amount: due.balance,
        action: { type: 'call', phone: b.phone, label: b.name },
        to: `/buyers/${b.id}`,
      })
    }
  })

  // low-producer alerts (recent 7-day avg dropped >25% vs prior 7-day)
  milkers(s).forEach((a) => {
    const ser = animalSeries(s, a.id, 14)
    const recent = ser.slice(7).reduce((t, d) => t + d.liters, 0) / 7
    const prior = ser.slice(0, 7).reduce((t, d) => t + d.liters, 0) / 7
    if (prior > 0 && recent < prior * 0.75) {
      const drop = Math.round((1 - recent / prior) * 100)
      alerts.push({
        id: 'milk_' + a.id,
        level: 'yellow',
        icon: '🟡',
        text: `${a.name || 'نمبر ' + a.tag} کا دودھ ${drop}% کم ہوا — وجہ چیک کریں`,
        to: `/milk/animal/${a.id}`,
      })
    }
  })

  // calving proximity (from mating events with an expectedCalving date)
  s.breedingEvents
    .filter((b) => b.type === 'mating' && b.expectedCalving)
    .forEach((b) => {
      const a = findAnimal(s, b.animalId)
      if (!a || a.status === 'sold' || a.status === 'dead') return
      const d = daysBetween(today(), b.expectedCalving)
      if (d < 0 || d > 14) return
      alerts.push({
        id: 'calve_' + b.id,
        level: d <= 7 ? 'red' : 'yellow',
        icon: d <= 7 ? '🔴' : '🟡',
        text: `${animalName(a)} کا بچہ ${d <= 0 ? 'کسی بھی وقت' : d + ' دن میں'} متوقع — تیاری کریں`,
        to: `/breeding`,
      })
    })

  // heat → mating window (heat logged today/yesterday)
  s.breedingEvents
    .filter((b) => b.type === 'heat' && daysBetween(b.date, today()) <= 1)
    .forEach((b) => {
      const a = findAnimal(s, b.animalId)
      if (!a) return
      alerts.push({
        id: 'heat_' + b.id,
        level: 'yellow',
        icon: '🟡',
        text: `${animalName(a)} کی گرمی — ابھی ملاپ/مصنوعی نسل کا وقت`,
        to: `/breeding`,
      })
    })

  // overdue vaccines, grouped by vaccine type
  const overdueVac = {}
  s.vaccinations.forEach((v) => {
    if (v.nextDue && v.nextDue < today()) overdueVac[v.vaccine] = (overdueVac[v.vaccine] || 0) + 1
  })
  Object.entries(overdueVac).forEach(([vac, count]) => {
    alerts.push({
      id: 'vac_' + vac,
      level: 'red',
      icon: '🔴',
      text: `${count} جانوروں کا ${vaccineLabel(vac, 'ur')} ٹیکہ باقی ہے`,
      to: `/health`,
    })
  })

  // medicine: low stock or expiring soon
  s.medicines.forEach((m) => {
    const expDays = m.expiry ? daysBetween(today(), m.expiry) : 999
    if (expDays >= 0 && expDays <= 15) {
      alerts.push({ id: 'medexp_' + m.id, level: 'yellow', icon: '🟡', text: `${m.name} دوائی ${expDays} دن میں ختم ہو جائے گی`, to: `/health` })
    } else if (m.qty <= 3) {
      alerts.push({ id: 'medlow_' + m.id, level: 'blue', icon: '🔵', text: `${m.name} صرف ${m.qty} ${m.unit} بچی ہیں`, to: `/health` })
    }
  })

  const order = { red: 0, yellow: 1, blue: 2 }
  alerts.sort((x, y) => order[x.level] - order[y.level])
  return alerts
}

// count of "today's tasks" = number of alerts needing action (red+yellow)
export const taskCount = (s) => buildAlerts(s).filter((a) => a.level !== 'blue').length

export const todayIncome = (s) =>
  s.deliveries.filter((d) => d.date === today()).reduce((t, d) => t + d.amount, 0)

// ---------- date-range helpers ----------
const monthKey = (d = today()) => d.slice(0, 7)
export const inLastDays = (date, n) => daysBetween(date, today()) >= 0 && daysBetween(date, today()) < n

// ---------- expenses (Module 3) ----------
export const monthExpenses = (s, mk = monthKey()) => s.expenses.filter((e) => e.date.startsWith(mk))
export const expensesByCategory = (s, mk = monthKey()) => {
  const out = {}
  monthExpenses(s, mk).forEach((e) => { out[e.category] = (out[e.category] || 0) + e.amount })
  return out
}
export const monthExpenseTotal = (s, mk = monthKey()) => monthExpenses(s, mk).reduce((t, e) => t + e.amount, 0)
export const weekExpenseTotal = (s) => s.expenses.filter((e) => inLastDays(e.date, 7)).reduce((t, e) => t + e.amount, 0)
export const topCategory = (s, mk = monthKey()) => {
  const by = expensesByCategory(s, mk)
  let best = null
  Object.entries(by).forEach(([k, v]) => { if (!best || v > best.amount) best = { cat: k, amount: v } })
  const total = monthExpenseTotal(s, mk)
  return best ? { ...best, pct: total ? Math.round((best.amount / total) * 100) : 0 } : null
}

// ---------- salaries (Module 3) ----------
export const monthlyPayroll = (s) => s.employees.filter((e) => e.active).reduce((t, e) => t + e.salary, 0)
export const isSalaryPaid = (s, empId, d = new Date()) =>
  s.salaryPayments.some((p) => p.employeeId === empId && p.month === d.getMonth() && p.year === d.getFullYear())

// ---------- breeding (Module 6) ----------
export const animalBreeding = (s, animalId) =>
  s.breedingEvents.filter((b) => b.animalId === animalId).slice().sort((a, b) => (a.date < b.date ? 1 : -1))
export const upcomingCalvings = (s) =>
  s.breedingEvents
    .filter((b) => b.type === 'mating' && b.expectedCalving && daysBetween(today(), b.expectedCalving) >= -10)
    .map((b) => ({ ...b, animal: findAnimal(s, b.animalId), daysLeft: daysBetween(today(), b.expectedCalving) }))
    .filter((b) => b.animal && b.animal.status !== 'sold' && b.animal.status !== 'dead')
    .sort((a, b) => a.daysLeft - b.daysLeft)

// ---------- vaccines & health (Module 7) ----------
export const animalVaccinations = (s, animalId) => s.vaccinations.filter((v) => v.animalId === animalId)
export const dueVaccinations = (s) =>
  s.vaccinations
    .map((v) => ({ ...v, animal: findAnimal(s, v.animalId), daysTo: v.nextDue ? daysBetween(today(), v.nextDue) : null }))
    .filter((v) => v.animal && v.daysTo !== null && v.daysTo <= 30)
    .sort((a, b) => a.daysTo - b.daysTo)
export const activeHealth = (s) => s.healthEvents.filter((h) => !h.resolvedDate)
export const animalHealth = (s, animalId) =>
  s.healthEvents.filter((h) => h.animalId === animalId).slice().sort((a, b) => (a.date < b.date ? 1 : -1))
export const lowOrExpiringMeds = (s) =>
  s.medicines.filter((m) => m.qty <= 3 || (m.expiry && daysBetween(today(), m.expiry) <= 30))

// ---------- buy/sell (Module 10) ----------
export const txYear = (s, year = new Date().getFullYear()) => s.transactions.filter((t) => +t.date.slice(0, 4) === year)
export const yearSpent = (s) => txYear(s).filter((t) => t.type === 'buy').reduce((x, t) => x + t.price, 0)
export const yearEarned = (s) => txYear(s).filter((t) => t.type === 'sell').reduce((x, t) => x + t.price, 0)
// profit on a sold animal: sale − (purchase + care costs we can attribute)
export function animalProfit(s, animalId) {
  const buy = s.transactions.find((t) => t.animalId === animalId && t.type === 'buy')
  const sell = s.transactions.find((t) => t.animalId === animalId && t.type === 'sell')
  const care = s.healthEvents.filter((h) => h.animalId === animalId).reduce((x, h) => x + (h.cost || 0), 0)
  if (!sell) return null
  return { buy: buy?.price || 0, sell: sell.price, care, profit: sell.price - (buy?.price || 0) - care }
}

// ---------- reports (Module 4) ----------
// stats for an arbitrary [start,end) date window (inclusive start, inclusive end)
export function rangeStats(s, startDate, endDate) {
  const milk =
    s.milkLogs.filter((m) => m.date >= startDate && m.date <= endDate)
      .reduce((t, m) => t + (m.morning || 0) + (m.evening || 0), 0) +
    (s.bulkMilk || []).filter((b) => b.date >= startDate && b.date <= endDate)
      .reduce((t, b) => t + (b.morning || 0) + (b.evening || 0), 0)
  const revenue = s.deliveries.filter((d) => d.date >= startDate && d.date <= endDate).reduce((t, d) => t + d.amount, 0)
  const expense = s.expenses.filter((e) => e.date >= startDate && e.date <= endDate).reduce((t, e) => t + e.amount, 0)
  // best animal by milk in window
  const perAnimal = {}
  s.milkLogs.filter((m) => m.date >= startDate && m.date <= endDate).forEach((m) => {
    perAnimal[m.animalId] = (perAnimal[m.animalId] || 0) + (m.morning || 0) + (m.evening || 0)
  })
  let bestId = null
  Object.entries(perAnimal).forEach(([id, v]) => { if (!bestId || v > perAnimal[bestId]) bestId = id })
  return { milk, revenue, expense, profit: revenue - expense, bestAnimal: bestId ? findAnimal(s, bestId) : null }
}
export function weekStats(s, weeksAgo = 0) {
  const end = addDays(today(), -7 * weeksAgo)
  const start = addDays(end, -6)
  return { start, end, ...rangeStats(s, start, end) }
}
export function monthStats(s, monthsAgo = 0) {
  const base = new Date()
  const first = new Date(base.getFullYear(), base.getMonth() - monthsAgo, 1)
  const last = new Date(base.getFullYear(), base.getMonth() - monthsAgo + 1, 0)
  const start = first.toISOString().slice(0, 10)
  const end = last.toISOString().slice(0, 10)
  return { start, end, monthIdx: first.getMonth(), year: first.getFullYear(), ...rangeStats(s, start, end) }
}
// simple linear regression on the last N days of daily total milk → next-period forecast
export function milkForecast(s, days = 30) {
  const pts = []
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today(), -i)
    pts.push(dayMilkTotal(s, date))
  }
  const n = pts.length
  const xbar = (n - 1) / 2
  const ybar = pts.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  pts.forEach((y, x) => { num += (x - xbar) * (y - ybar); den += (x - xbar) ** 2 })
  const slope = den ? num / den : 0
  const intercept = ybar - slope * xbar
  // forecast next-30-day total
  let next = 0
  for (let x = n; x < n + 30; x++) next += Math.max(0, slope * x + intercept)
  return { perDayNow: Math.max(0, slope * (n - 1) + intercept), slope, next30: next, trendUp: slope >= 0 }
}

// ---------- calendar (Module 8) ----------
// returns a map 'YYYY-MM-DD' -> Set of event-type tags for the given month
export function calendarEvents(s, year, month) {
  const map = {}
  const add = (date, tag) => {
    if (!date || +date.slice(0, 4) !== year || +date.slice(5, 7) - 1 !== month) return
    ;(map[date] = map[date] || new Set()).add(tag)
  }
  s.milkLogs.forEach((m) => add(m.date, 'milk'))
  s.deliveries.forEach((d) => add(d.date, 'sale'))
  s.expenses.forEach((e) => add(e.date, 'expense'))
  s.breedingEvents.forEach((b) => add(b.date, b.type === 'calving' ? 'calving' : 'breeding'))
  s.healthEvents.forEach((h) => add(h.date, 'health'))
  s.vaccinations.forEach((v) => add(v.nextDue, 'vaccine'))
  return map
}
export function dayDetail(s, date) {
  return {
    milk: dayMilkTotal(s, date),
    income: s.deliveries.filter((d) => d.date === date).reduce((t, d) => t + d.amount, 0),
    expenses: s.expenses.filter((e) => e.date === date),
    breeding: s.breedingEvents.filter((b) => b.date === date),
    health: s.healthEvents.filter((h) => h.date === date),
    vaccines: s.vaccinations.filter((v) => v.nextDue === date),
  }
}

// Everything that happened on a single day, grouped + editable (each row carries
// its collection + id so it can open the generic editor). Drives the Day Record.
export function dayRecords(s, date, lang = 'ur') {
  const milkLogs = s.milkLogs
    .filter((m) => m.date === date)
    .map((m) => ({
      id: m.id, collection: 'milkLogs', name: animalName(findAnimal(s, m.animalId)),
      morning: m.morning || 0, evening: m.evening || 0, total: (m.morning || 0) + (m.evening || 0),
    }))
  const bulk = (s.bulkMilk || []).find((b) => b.date === date) || null
  const sales = s.deliveries
    .filter((d) => d.date === date)
    .map((d) => {
      const buyer = s.buyers.find((x) => x.id === d.buyerId)
      return { id: d.id, collection: 'deliveries', buyerName: buyer ? buyer.name : '—', liters: d.liters, rate: d.rate, amount: d.amount }
    })
  const health = s.healthEvents
    .filter((h) => h.date === date)
    .map((h) => ({
      id: h.id, collection: 'healthEvents', name: animalName(findAnimal(s, h.animalId)),
      label: h.diagnosis || h.treatment || (h.symptoms || []).map(symptomLabel).join('، ') || 'صحت',
    }))
  const expenses = s.expenses
    .filter((e) => e.date === date)
    .map((e) => ({ id: e.id, collection: 'expenses', label: e.note || expenseCat(e.category)[lang], icon: expenseCat(e.category).icon, amount: e.amount }))
  const breedTypes = { heat: 'گرمی', mating: 'ملاپ/AI', pregnancy: 'حمل', calving: 'بچہ' }
  const breeding = s.breedingEvents
    .filter((bv) => bv.date === date)
    .map((bv) => ({ id: bv.id, collection: 'breedingEvents', name: animalName(findAnimal(s, bv.animalId)), label: breedTypes[bv.type] || bv.type }))
  const vaccinations = s.vaccinations
    .filter((v) => v.givenDate === date)
    .map((v) => ({ id: v.id, collection: 'vaccinations', name: animalName(findAnimal(s, v.animalId)), label: vaccineLabel(v.vaccine, lang) }))

  const income = sales.reduce((t, d) => t + d.amount, 0)
  const expenseTotal = expenses.reduce((t, e) => t + e.amount, 0)
  const milkTotal = milkLogs.reduce((t, m) => t + m.total, 0) + (bulk ? (bulk.morning || 0) + (bulk.evening || 0) : 0)
  const count = milkLogs.length + (bulk ? 1 : 0) + sales.length + health.length + expenses.length + breeding.length + vaccinations.length
  return { milkLogs, bulk, milkTotal, sales, health, expenses, breeding, vaccinations, income, expenseTotal, profit: income - expenseTotal, count }
}
