import { useEffect, useState } from 'react'
import { useT } from '../../i18n/useT.js'
import { weekdayShort } from '../../lib/date.js'
import { fetchWeather, loadCached, wmo, advisories, FAISALABAD } from '../../lib/weather.js'
import PageHeader from '../../components/PageHeader.jsx'

export default function Weather() {
  const { t, lang } = useT()
  const [data, setData] = useState(() => loadCached())
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)

  async function load(loc) {
    setLoading(true)
    setOffline(false)
    try {
      const d = await fetchWeather(loc)
      setData(d)
    } catch {
      setOffline(true) // keep showing cached
    } finally {
      setLoading(false)
    }
  }

  // on mount: refresh if cache is missing or older than 6h
  useEffect(() => {
    const stale = !data || Date.now() - data.fetchedAt > 6 * 3600 * 1000
    if (stale) load(data ? { lat: data.lat, lon: data.lon, place: data.place } : FAISALABAD)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function useGps() {
    if (!navigator.geolocation) return load(FAISALABAD)
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => load({ lat: pos.coords.latitude, lon: pos.coords.longitude, place: 'میرا فارم' }),
      () => load(FAISALABAD),
      { timeout: 8000 },
    )
  }

  const advice = advisories(data)
  const hoursAgo = data ? Math.round((Date.now() - data.fetchedAt) / 3600000) : 0

  return (
    <div className="pb-8">
      <PageHeader title={t('weather_title')} color="bg-sky" />

      {!data && loading && (
        <div className="px-4 mt-8 text-center font-urdu text-lg text-muted">{t('weather_locating')}</div>
      )}

      {data && (
        <>
          {/* current */}
          <div className="px-4 mt-3">
            <div className="gs-card p-5 text-center bg-gradient-to-b from-sky/10 to-transparent">
              <div className="font-urdu text-lg text-muted">📍 {data.place}</div>
              <div style={{ fontSize: 56 }}>{wmo(data.current.weather_code).emoji}</div>
              <div className="num text-5xl font-bold text-sky">{Math.round(data.current.temperature_2m)}°C</div>
              <div className="font-urdu text-lg">{wmo(data.current.weather_code).ur}</div>
              <div className="font-urdu text-sm text-muted mt-1">
                نمی <span className="num">{data.current.relative_humidity_2m}%</span> · ہوا <span className="num">{Math.round(data.current.wind_speed_10m)}</span> km/h
              </div>
            </div>
          </div>

          {/* status line */}
          <div className="px-4 mt-2 text-center font-urdu text-sm text-muted">
            {offline ? `📴 ${t('weather_offline')}` : `${t('weather_updated')}: ${hoursAgo === 0 ? 'ابھی' : hoursAgo + ' گھنٹے پہلے'}`}
          </div>

          {/* advisories */}
          <div className="px-4 mt-3">
            <h3 className="font-urdu text-lg font-bold mb-1">🐄 {t('weather_advice')}</h3>
            <div className="space-y-2">
              {advice.map((a, i) => (
                <div key={i} className="gs-card p-3 font-urdu text-lg leading-relaxed border-s-[6px] border-sky">{a}</div>
              ))}
            </div>
          </div>

          {/* 7-day */}
          <div className="px-4 mt-4">
            <h3 className="font-urdu text-lg font-bold mb-1">📅 7 دن</h3>
            <div className="gs-card divide-y divide-black/5">
              {data.daily.time.map((d, i) => (
                <div key={d} className="flex items-center px-4 py-2.5 gap-3">
                  <span className="font-urdu text-base w-16">{i === 0 ? 'آج' : weekdayShort(d, lang)}</span>
                  <span style={{ fontSize: 24 }}>{wmo(data.daily.weather_code[i]).emoji}</span>
                  <span className="flex-1 font-urdu text-sm text-sky">💧 <span className="num">{data.daily.precipitation_probability_max[i]}%</span></span>
                  <span className="num text-base font-bold">
                    {Math.round(data.daily.temperature_2m_max[i])}° <span className="text-muted">/ {Math.round(data.daily.temperature_2m_min[i])}°</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="px-4 mt-4">
        <button onClick={useGps} disabled={loading} className="gs-btn bg-sky text-white w-full disabled:opacity-50">
          📍 {loading ? t('weather_locating') : t('weather_useGps')}
        </button>
      </div>
    </div>
  )
}
