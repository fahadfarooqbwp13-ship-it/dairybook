// Date helpers. Dates are stored as 'YYYY-MM-DD' strings (local), which keeps
// them stable across timezones and trivially comparable/sortable.

const UR_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
]
const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const UR_DAYS = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ymd(d = new Date()) {
  const x = typeof d === 'string' ? new Date(d + 'T00:00:00') : d
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today() {
  return ymd(new Date())
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return ymd(d)
}

export function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db - da) / 86400000)
}

// e.g. "جمعہ، 13 جون" / "Friday, 13 Jun"
export function longDate(dateStr, lang = 'ur') {
  const d = new Date(dateStr + 'T00:00:00')
  const days = lang === 'ur' ? UR_DAYS : EN_DAYS
  const months = lang === 'ur' ? UR_MONTHS : EN_MONTHS
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]}`
}

// e.g. "13 جون" / "13 Jun"
export function shortDate(dateStr, lang = 'ur') {
  const d = new Date(dateStr + 'T00:00:00')
  const months = lang === 'ur' ? UR_MONTHS : EN_MONTHS
  return `${d.getDate()} ${months[d.getMonth()]}`
}

// short weekday label for charts: "پیر" / "Mon"
export function weekdayShort(dateStr, lang = 'ur') {
  const d = new Date(dateStr + 'T00:00:00')
  if (lang === 'ur') return UR_DAYS[d.getDay()]
  return EN_DAYS[d.getDay()].slice(0, 3)
}

export function monthName(monthIdx, lang = 'ur') {
  return (lang === 'ur' ? UR_MONTHS : EN_MONTHS)[monthIdx]
}

// "5 دن پہلے" / "5 days ago"
export function agoText(dateStr, lang = 'ur') {
  if (!dateStr) return lang === 'ur' ? 'کبھی نہیں' : 'never'
  const d = daysBetween(dateStr, today())
  if (d <= 0) return lang === 'ur' ? 'آج' : 'today'
  if (d === 1) return lang === 'ur' ? 'کل' : 'yesterday'
  return lang === 'ur' ? `${d} دن پہلے` : `${d} days ago`
}
