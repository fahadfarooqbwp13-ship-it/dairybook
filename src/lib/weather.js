// Open-Meteo (free, no API key). Fetched when online, cached in localStorage so
// the last forecast still shows offline. City name via free reverse-geocoding.
const KEY = 'dairybook-weather'
export const FAISALABAD = { lat: 31.418, lon: 73.079, place: 'فیصل آباد' }

// Common Pakistani cities with fixed coords — reliable one-tap location with no
// geocoding (Open-Meteo's search can't resolve Urdu city names).
export const CITIES = [
  { place: 'فیصل آباد', lat: 31.418, lon: 73.079 },
  { place: 'لاہور', lat: 31.52, lon: 74.358 },
  { place: 'کراچی', lat: 24.861, lon: 67.01 },
  { place: 'اسلام آباد', lat: 33.684, lon: 73.048 },
  { place: 'راولپنڈی', lat: 33.626, lon: 73.071 },
  { place: 'ملتان', lat: 30.196, lon: 71.472 },
  { place: 'گوجرانوالہ', lat: 32.161, lon: 74.19 },
  { place: 'سرگودھا', lat: 32.083, lon: 72.671 },
  { place: 'سیالکوٹ', lat: 32.493, lon: 74.531 },
  { place: 'بہاولپور', lat: 29.397, lon: 71.683 },
  { place: 'ساہیوال', lat: 30.666, lon: 73.106 },
  { place: 'شیخوپورہ', lat: 31.713, lon: 73.985 },
  { place: 'جھنگ', lat: 31.27, lon: 72.316 },
  { place: 'قصور', lat: 31.116, lon: 74.45 },
  { place: 'پشاور', lat: 34.008, lon: 71.578 },
  { place: 'حیدرآباد', lat: 25.397, lon: 68.374 },
  { place: 'رحیم یار خان', lat: 28.42, lon: 70.296 },
  { place: 'ڈی جی خان', lat: 30.058, lon: 70.634 },
]
export const findCity = (name) => {
  const q = (name || '').trim().toLowerCase()
  return CITIES.find((c) => c.place.toLowerCase().includes(q) || q.includes(c.place.toLowerCase()))
}

const WMO = [
  { codes: [0], emoji: '☀️', ur: 'صاف' },
  { codes: [1, 2, 3], emoji: '⛅', ur: 'جزوی بادل' },
  { codes: [45, 48], emoji: '🌫️', ur: 'دھند' },
  { codes: [51, 53, 55, 56, 57], emoji: '🌦️', ur: 'پھوار' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], emoji: '🌧️', ur: 'بارش' },
  { codes: [71, 73, 75, 77, 85, 86], emoji: '❄️', ur: 'برف' },
  { codes: [95, 96, 99], emoji: '⛈️', ur: 'گرج چمک' },
]
export function wmo(code) {
  return WMO.find((w) => w.codes.includes(code)) || { emoji: '🌤️', ur: '—' }
}

export function loadCached() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

// reverse geocode coords → city name (free, no key, CORS-enabled). Best-effort.
export async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
    const j = await r.json()
    return j.city || j.locality || j.principalSubdivision || ''
  } catch {
    return ''
  }
}

// forward geocode a typed city name → { lat, lon, place }
export async function forwardGeocode(name) {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`)
  const j = await r.json()
  const hit = j.results && j.results[0]
  if (!hit) throw new Error('not found')
  return { lat: hit.latitude, lon: hit.longitude, place: hit.name }
}

export async function fetchWeather({ lat, lon, place }) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
    `&timezone=Asia/Karachi&forecast_days=7`
  const r = await fetch(url)
  if (!r.ok) throw new Error('weather fetch failed')
  const j = await r.json()
  // resolve a city name if not provided
  let cityName = place
  if (!cityName) cityName = (await reverseGeocode(lat, lon)) || 'میرا فارم'
  const data = { fetchedAt: Date.now(), place: cityName, lat, lon, current: j.current, daily: j.daily }
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

// livestock-specific advice (Urdu), driven by the forecast
export function advisories(data) {
  if (!data) return []
  const out = []
  const maxToday = data.daily?.temperature_2m_max?.[0]
  const minToday = data.daily?.temperature_2m_min?.[0]
  const rainSum = Math.max(...(data.daily?.precipitation_sum?.slice(0, 3) || [0]))
  const rainProb = Math.max(...(data.daily?.precipitation_probability_max?.slice(0, 3) || [0]))
  const humid = data.current?.relative_humidity_2m ?? 0

  if (maxToday >= 40) out.push('🥵 سخت گرمی — جانوروں کو سایہ اور ٹھنڈا پانی دیں')
  else if (maxToday >= 35) out.push('☀️ گرم دن — دوپہر میں سایہ اور پانی کا خیال رکھیں')
  if (rainSum >= 1 || rainProb >= 60) out.push('🌧️ بارش آنے والی ہے — چارہ ابھی ڈھک کر رکھیں')
  if (minToday <= 5) out.push('🥶 سخت سردی — نوزائیدہ جانوروں کو گرم رکھیں')
  if (maxToday >= 30 && humid >= 70) out.push('💧 گرم اور مرطوب — منہ کھر (FMD) کا خطرہ، نظر رکھیں')
  if (out.length === 0) out.push('✅ موسم جانوروں کے لیے ٹھیک ہے')
  return out
}
