// Deterministic seed data: a believable small Pakistani dairy farm.
// Everything is generated relative to "today" so the app always looks live.
import { today, addDays } from '../lib/date.js'
import { GESTATION_DAYS } from '../lib/domain.js'

// tiny seeded RNG (mulberry32) so the demo farm is stable across reloads
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let _id = 1
const id = (p) => `${p}_${_id++}`

// emoji + tint per species (stand-in for photos in v0.1)
const COW = { emoji: '🐄', tint: '#FDE7C9' }
const BUF = { emoji: '🐃', tint: '#E3E0F2' }

// [tag, name, species, breed, sex, status, ageYears, weight, baseMilk]
const ANIMAL_DEFS = [
  ['7', 'ہیرا', 'buffalo', 'نیلی راوی', 'f', 'active', 5, 540, 13.5],
  ['5', 'موتی', 'cow', 'ساہیوال', 'f', 'active', 4, 420, 11],
  ['3', 'چاندنی', 'cow', 'ساہیوال', 'f', 'active', 6, 410, 9], // low producer (declining)
  ['12', 'گلابو', 'buffalo', 'کنڈی', 'f', 'active', 7, 560, 12],
  ['9', 'سوہنی', 'cow', 'چولستانی', 'f', 'active', 3, 390, 10],
  ['15', 'رانی', 'buffalo', 'نیلی راوی', 'f', 'pregnant', 6, 575, 8.5],
  ['2', 'کالی', 'cow', 'ساہیوال', 'f', 'pregnant', 5, 430, 7],
  ['21', 'بسنتی', 'cow', 'ساہیوال', 'f', 'active', 4, 405, 10.5],
  ['8', 'نازو', 'buffalo', 'کنڈی', 'f', 'active', 8, 580, 11.5],
  ['11', 'پھولو', 'cow', 'فریزین کراس', 'f', 'active', 3, 460, 14],
  ['4', 'شیرو', 'cow', 'ساہیوال', 'm', 'active', 4, 620, 0], // bull
  ['18', '—', 'buffalo', 'نیلی راوی', 'm', 'calf', 0, 95, 0], // calf
]

const BUYER_DEFS = [
  // [name, phone, address, dailyQty, rate, cycleDays, lastPaidDaysAgo, color]
  ['خالد دودھ والا', '0300-1234567', 'چک نمبر 204 رب', 18, 80, 7, 9, '#0277BD'],
  ['اللہ دتہ', '0301-7654321', 'گاؤں جھنگ روڈ', 25, 78, 30, 5, '#2E7D32'],
  ['شبیر حلوائی', '0321-5556677', 'بازار، اڈا', 20, 85, 15, 18, '#AD1457'],
  ['رشید', '0333-2223344', 'محلہ نواں کوٹ', 12, 75, 7, 3, '#E65100'],
]

export function buildSeed() {
  _id = 1
  const r = rng(20260613)
  const t = today()

  const animals = ANIMAL_DEFS.map(([tag, name, species, breed, sex, status, age, weight, base]) => ({
    id: id('a'),
    tag,
    name: name === '—' ? '' : name,
    species,
    breed,
    sex,
    status,
    dob: addDays(t, -Math.round(age * 365 + r() * 120)),
    weight,
    base, // base daily liters (per-animal milk model) — not persisted UI, used by seed
    ...(species === 'buffalo' ? BUF : COW),
    createdAt: addDays(t, -Math.round(age * 365)),
  }))

  // 30 days of milk logs for milking females (status active/pregnant, female, base>0)
  const milkLogs = []
  const milkers = animals.filter((a) => a.sex === 'f' && a.base > 0)
  for (let d = 29; d >= 0; d--) {
    const date = addDays(t, -d)
    for (const a of milkers) {
      let base = a.base
      // chandni (#3) declines ~30% over the last 10 days → triggers low-producer alert
      if (a.tag === '3' && d < 10) base = a.base * (1 - 0.32 * ((10 - d) / 10))
      // pregnant animals taper down
      if (a.status === 'pregnant') base = a.base * 0.85
      const wobble = (x) => Math.max(0, +(x * (0.9 + r() * 0.2)).toFixed(1))
      const morning = wobble(base * 0.55)
      const evening = wobble(base * 0.45)
      milkLogs.push({ id: id('m'), animalId: a.id, date, morning, evening })
    }
  }

  const buyers = BUYER_DEFS.map(([name, phone, address, dailyQty, rate, cycleDays, , color]) => ({
    id: id('b'),
    name,
    phone,
    address,
    dailyQty,
    rate,
    cycleDays,
    color,
    createdAt: addDays(t, -60),
  }))

  // deliveries: last 30 days, each buyer ~dailyQty at their rate
  const deliveries = []
  for (let d = 29; d >= 0; d--) {
    const date = addDays(t, -d)
    buyers.forEach((b) => {
      const liters = Math.max(0, Math.round((b.dailyQty + (r() * 4 - 2)) * 2) / 2)
      deliveries.push({
        id: id('d'),
        buyerId: b.id,
        date,
        liters,
        rate: b.rate,
        amount: Math.round(liters * b.rate),
      })
    })
  }

  // payments: one per buyer, `lastPaidDaysAgo` ago, clearing everything older than that
  const payments = []
  BUYER_DEFS.forEach(([, , , , , , lastPaidDaysAgo], i) => {
    const b = buyers[i]
    const payDate = addDays(t, -lastPaidDaysAgo)
    const cleared = deliveries
      .filter((d) => d.buyerId === b.id && d.date < payDate)
      .reduce((s, d) => s + d.amount, 0)
    if (cleared > 0) {
      payments.push({ id: id('p'), buyerId: b.id, date: payDate, amount: cleared, note: 'پرانا حساب' })
    }
  })

  const byTag = (tag) => animals.find((a) => a.tag === tag)
  const now = new Date(t + 'T00:00:00')

  // ---- expenses (Module 3): ~6 weeks of mixed entries ----
  const expenses = [
    { id: id('e'), category: 'feed', amount: 8200, note: 'ونڈا 4 بوری', date: addDays(t, -1) },
    { id: id('e'), category: 'feed', amount: 12500, note: 'توڑی 5 من', date: addDays(t, -6) },
    { id: id('e'), category: 'medicine', amount: 1500, note: 'کیلشیم', date: addDays(t, -5) },
    { id: id('e'), category: 'utilities', amount: 3400, note: 'بجلی بل', date: addDays(t, -9) },
    { id: id('e'), category: 'vet', amount: 2000, note: 'ڈاکٹر وزٹ', date: addDays(t, -11) },
    { id: id('e'), category: 'transport', amount: 1800, note: 'دودھ ترسیل', date: addDays(t, -3) },
    { id: id('e'), category: 'repairs', amount: 2600, note: 'موٹر مرمت', date: addDays(t, -14) },
    { id: id('e'), category: 'feed', amount: 9000, note: 'ونڈا', date: addDays(t, -20) },
  ]

  // ---- employees + salaries (Module 3) ----
  const employees = [
    { id: id('emp'), name: 'اللہ رکھا', role: 'worker', salary: 22000, joinDate: addDays(t, -430), active: true },
    { id: id('emp'), name: 'نذیر', role: 'guard', salary: 18000, joinDate: addDays(t, -760), active: true },
  ]
  const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const salaryPayments = employees.map((e) => ({
    id: id('sp'),
    employeeId: e.id,
    month: pm.getMonth(),
    year: pm.getFullYear(),
    amount: e.salary,
    date: addDays(t, -10),
    note: 'پچھلا مہینہ',
  }))

  // ---- breeding (Module 6) ----
  const breedingEvents = []
  // pregnant animals: mating ~6 months back → expected calving soon
  ;[
    ['15', -170],
    ['2', -120],
  ].forEach(([tag, off]) => {
    const a = byTag(tag)
    if (!a) return
    const matingDate = addDays(t, off)
    breedingEvents.push({
      id: id('br'),
      animalId: a.id,
      type: 'mating',
      date: matingDate,
      method: 'ai',
      aiDetails: 'سانڈ: نیلی راوی، ڈوز 1',
      partnerId: '',
      expectedCalving: addDays(matingDate, GESTATION_DAYS),
      outcome: '',
      offspringId: '',
    })
  })
  // a recent heat on an active female → reminder
  breedingEvents.push({
    id: id('br'),
    animalId: byTag('9').id,
    type: 'heat',
    date: addDays(t, -1),
    method: '',
    aiDetails: '',
    partnerId: '',
    expectedCalving: '',
    outcome: '',
    offspringId: '',
  })
  // a past calving that produced the calf (#18) from #8
  breedingEvents.push({
    id: id('br'),
    animalId: byTag('8').id,
    type: 'calving',
    date: byTag('18').dob,
    method: '',
    aiDetails: '',
    partnerId: '',
    expectedCalving: '',
    outcome: 'live',
    offspringId: byTag('18').id,
  })

  // ---- vaccinations (Module 7) ----
  const vaccinations = []
  animals.forEach((a, i) => {
    // FMD given ~3 months ago, next due ~3 months ahead
    vaccinations.push({
      id: id('vac'),
      animalId: a.id,
      vaccine: 'fmd',
      givenDate: addDays(t, -95),
      nextDue: addDays(t, 90),
      vet: 'ڈاکٹر اکرم',
      cost: 150,
      batch: 'FMD-2026A',
    })
    // HS overdue for the first 4 animals (monsoon prep) → red alert
    if (i < 4) {
      vaccinations.push({
        id: id('vac'),
        animalId: a.id,
        vaccine: 'hs',
        givenDate: addDays(t, -380),
        nextDue: addDays(t, -12),
        vet: 'ڈاکٹر اکرم',
        cost: 120,
        batch: 'HS-2025',
      })
    }
  })

  // ---- health events (Module 7) ----
  const healthEvents = [
    {
      id: id('he'),
      animalId: byTag('3').id,
      symptoms: ['noappetite', 'lowmilk'],
      diagnosis: 'ہاضمہ کی خرابی',
      treatment: 'ٹانک + پرہیز',
      medicine: 'ڈائجیسٹ پاؤڈر',
      cost: 800,
      date: addDays(t, -4),
      resolvedDate: '',
      notes: '',
    },
    {
      id: id('he'),
      animalId: byTag('12').id,
      symptoms: ['limp'],
      diagnosis: 'کھر کا مسئلہ',
      treatment: 'فٹ باتھ',
      medicine: 'زنک سلفیٹ',
      cost: 500,
      date: addDays(t, -25),
      resolvedDate: addDays(t, -18),
      notes: 'ٹھیک ہو گئی',
    },
  ]

  // ---- medicine inventory (Module 7) ----
  const medicines = [
    { id: id('med'), name: 'آکسیٹوسن', qty: 3, unit: 'شیشی', expiry: addDays(t, 40) },
    { id: id('med'), name: 'کیلشیم بورو', qty: 11, unit: 'بوتل', expiry: addDays(t, 210) },
    { id: id('med'), name: 'ڈی ورمر', qty: 6, unit: 'گولی', expiry: addDays(t, 12) },
    { id: id('med'), name: 'اینٹی بائیوٹک', qty: 2, unit: 'وائل', expiry: addDays(t, 120) },
  ]

  // ---- buy/sell log (Module 10) ----
  const transactions = [
    { id: id('tx'), animalId: byTag('3').id, type: 'buy', counterparty: 'منڈی فیصل آباد', price: 95000, weight: 380, date: addDays(t, -200), notes: 'ساہیوال' },
    { id: id('tx'), animalId: byTag('11').id, type: 'buy', counterparty: 'چوہدری ڈیری', price: 130000, weight: 430, date: addDays(t, -150), notes: 'فریزین کراس' },
    { id: id('tx'), animalId: '', type: 'sell', counterparty: 'قصاب — اڈا', price: 110000, weight: 600, date: addDays(t, -60), notes: 'پرانا بیل فروخت' },
  ]

  // strip the internal `base` helper from persisted animals
  const cleanAnimals = animals.map(({ base, ...a }) => a)

  return {
    farmName: 'میرا ڈیری فارم',
    ownerName: '',
    animals: cleanAnimals,
    milkLogs,
    bulkMilk: [],
    buyers,
    deliveries,
    payments,
    expenses,
    employees,
    salaryPayments,
    breedingEvents,
    vaccinations,
    healthEvents,
    medicines,
    transactions,
    recycleBin: [],
    lastBackupAt: addDays(t, 0) + 'T06:42:00',
  }
}

// An empty farm for "Start Fresh / New Farm".
export function emptyFarm() {
  return {
    farmName: 'میرا فارم',
    ownerName: '',
    animals: [],
    milkLogs: [],
    bulkMilk: [],
    buyers: [],
    deliveries: [],
    payments: [],
    expenses: [],
    employees: [],
    salaryPayments: [],
    breedingEvents: [],
    vaccinations: [],
    healthEvents: [],
    medicines: [],
    transactions: [],
    recycleBin: [],
    lastBackupAt: null,
  }
}
