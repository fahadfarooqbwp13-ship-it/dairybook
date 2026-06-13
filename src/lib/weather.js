// Open-Meteo (free, no API key). Fetched when online, cached in localStorage
// so the last forecast still shows offline. Kept out of the zustand store so
// it doesn't bloat the backup payload or trigger undo snapshots.
const KEY = 'gaesathi-weather'
export const FAISALABAD = { lat: 31.418, lon: 73.079, place: 'فیصل آباد' }

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

export async function fetchWeather({ lat, lon, place }) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&forecast_days=7`
  const r = await fetch(url)
  if (!r.ok) throw new Error('weather fetch failed')
  const j = await r.json()
  const data = { fetchedAt: Date.now(), place, lat, lon, current: j.current, daily: j.daily }
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

// livestock-specific advice (Urdu), driven by the forecast
export function advisories(data) {
  if (!data) return []
  const out = []
  const maxToday = data.daily?.temperature_2m_max?.[0]
  const minToday = data.daily?.temperature_2m_min?.[0]
  const rainProb = Math.max(...(data.daily?.precipitation_probability_max?.slice(0, 3) || [0]))
  const humid = data.current?.relative_humidity_2m ?? 0

  if (maxToday >= 40) out.push('🥵 شدید گرمی — جانوروں کو سایہ دیں اور اضافی پانی پلائیں')
  else if (maxToday >= 35) out.push('☀️ گرم دن — دوپہر میں سایہ اور پانی کا خیال رکھیں')
  if (rainProb >= 60) out.push('🌧️ بارش متوقع — چارہ ابھی ڈھک کر رکھیں')
  if (minToday <= 8) out.push('🥶 ٹھنڈ — نوزائیدہ بچوں کے لیے گرم جگہ بنائیں')
  if (maxToday >= 30 && humid >= 70) out.push('💧 گرم اور مرطوب — منہ کھر (FMD) اور چھالوں کا خطرہ، نظر رکھیں')
  if (out.length === 0) out.push('✅ موسم جانوروں کے لیے ٹھیک ہے')
  return out
}
