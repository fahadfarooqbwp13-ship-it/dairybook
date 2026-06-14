import { useEffect, useState } from 'react'
import { useT } from '../../i18n/useT.js'
import { weekdayShort } from '../../lib/date.js'
import { fetchWeather, loadCached, wmo, advisories, forwardGeocode, findCity, CITIES, FAISALABAD } from '../../lib/weather.js'
import PageHeader from '../../components/PageHeader.jsx'

export default function Weather() {
  const { lang } = useT()
  const [data, setData] = useState(() => loadCached())
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [city, setCity] = useState('')
  const [err, setErr] = useState('')
  const [showCities, setShowCities] = useState(false)

  async function load(loc) {
    setLoading(true)
    setOffline(false)
    setErr('')
    try {
      const d = await fetchWeather(loc)
      setData(d)
      setShowCities(false)
    } catch {
      setOffline(true) // keep showing cached if any
    } finally {
      setLoading(false)
    }
  }

  // On open: show real weather right away (last city, else Faisalabad). No GPS
  // prompt on mount — it hangs/denies in the wrapped app and looks broken.
  useEffect(() => {
    const stale = !data || Date.now() - data.fetchedAt > 3 * 3600 * 1000
    if (stale) load(data ? { lat: data.lat, lon: data.lon, place: data.place } : FAISALABAD)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function useGps() {
    setErr('')
    if (!navigator.geolocation) return setErr('اس فون پر GPS دستیاب نہیں — شہر منتخب کریں')
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => load({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => { setLoading(false); setErr('مقام نہیں ملا — نیچے سے شہر منتخب کریں') },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  async function applyManual() {
    if (!city.trim()) return
    setErr('')
    const local = findCity(city) // resolves Urdu names from our city list
    if (local) {
      setCity('')
      return load(local)
    }
    setLoading(true)
    try {
      const loc = await forwardGeocode(city.trim())
      setCity('')
      await load(loc)
    } catch {
      setErr('یہ شہر نہیں ملا — نیچے فہرست سے منتخب کریں')
      setLoading(false)
    }
  }

  const advice = advisories(data)
  const hoursAgo = data ? Math.round((Date.now() - data.fetchedAt) / 3600000) : 0

  return (
    <div className="pb-8">
      <PageHeader title="موسم" color="bg-sky" />

      {!data && loading && (
        <div className="px-4 mt-10 text-center font-urdu text-lg text-muted">🌤️ موسم لوڈ ہو رہا ہے…</div>
      )}

      {data && (
        <>
          {/* current */}
          <div className="px-4 mt-3">
            <div className="gs-card p-5 text-center">
              <div className="font-urdu text-lg text-muted">📍 {data.place}</div>
              <div style={{ fontSize: 56 }}>{wmo(data.current.weather_code).emoji}</div>
              <div className="num text-5xl font-bold text-sky">{Math.round(data.current.temperature_2m)}°C</div>
              <div className="font-urdu text-lg">{wmo(data.current.weather_code).ur}</div>
              <div className="font-urdu text-sm text-muted mt-1">
                نمی <span className="num">{data.current.relative_humidity_2m}%</span> · ہوا <span className="num">{Math.round(data.current.wind_speed_10m)}</span> km/h
              </div>
            </div>
          </div>

          {/* status */}
          <div className="px-4 mt-2 text-center font-urdu text-sm text-muted">
            {offline ? '📴 آف لائن — آخری محفوظ موسم' : `آخری اپ ڈیٹ: ${hoursAgo === 0 ? 'ابھی' : hoursAgo + ' گھنٹے پہلے'}`}
          </div>

          {/* advisories */}
          <div className="px-4 mt-3">
            <h3 className="font-urdu text-lg font-bold mb-1">🐄 فارم مشورہ</h3>
            <div className="space-y-2">
              {advice.map((a, i) => (
                <div key={i} className="gs-card p-3 font-urdu text-lg leading-relaxed border-s-[6px] border-sky">{a}</div>
              ))}
            </div>
          </div>

          {/* 7-day forecast */}
          <div className="px-4 mt-4">
            <h3 className="font-urdu text-lg font-bold mb-1">📅 7 دن کا موسم</h3>
            <div className="gs-card divide-y divide-black/5">
              {data.daily.time.map((d, i) => {
                const rain = data.daily.precipitation_sum ? data.daily.precipitation_sum[i] : 0
                return (
                  <div key={d} className="flex items-center px-4 py-2.5 gap-3">
                    <span className="font-urdu text-base w-20">{i === 0 ? 'آج' : weekdayShort(d, lang)}</span>
                    <span style={{ fontSize: 24 }}>{wmo(data.daily.weather_code[i]).emoji}</span>
                    <span className="flex-1 font-urdu text-sm text-sky">
                      {rain > 0 ? <>🌧️ <span className="num">{Math.round(rain)}mm</span></> : <span className="text-muted">بارش نہیں</span>}
                    </span>
                    <span className="num text-base font-bold">
                      {Math.round(data.daily.temperature_2m_max[i])}° <span className="text-muted">/ {Math.round(data.daily.temperature_2m_min[i])}°</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* location controls */}
      <div className="px-4 mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={useGps} disabled={loading} className="gs-btn bg-sky text-white text-base disabled:opacity-50">📍 میرا مقام (GPS)</button>
          <button onClick={() => setShowCities((v) => !v)} className="gs-btn bg-white text-sky border-2 border-sky/20 text-base">🏙️ شہر منتخب کریں</button>
        </div>
        {err && <div className="font-urdu text-danger text-sm text-center">{err}</div>}

        {showCities && (
          <div className="gs-card p-3">
            <div className="flex gap-2 mb-2">
              <input value={city} onChange={(e) => setCity(e.target.value)} className="gs-input font-urdu flex-1" placeholder="شہر کا نام لکھیں" />
              <button onClick={applyManual} disabled={loading} className="gs-btn bg-sky text-white px-4 disabled:opacity-50">تلاش</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button key={c.place} onClick={() => load(c)} className="px-3 rounded-full font-urdu text-base bg-cream text-ink" style={{ minHeight: 44 }}>
                  {c.place}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
