import { useState } from 'react'

// Reusable Urdu/English voice-to-text button. Fills a field via onResult.
// Uses the browser SpeechRecognition API (best-effort; silently no-ops if
// the device lacks it). Big 52dp target for fat fingers.
export default function VoiceButton({ onResult, lang = 'ur', size = 52, className = '' }) {
  const [listening, setListening] = useState(false)

  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = lang === 'ur' ? 'ur-PK' : 'en-US'
    rec.interimResults = false
    setListening(true)
    rec.onresult = (e) => onResult(e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    try {
      rec.start()
    } catch {
      setListening(false)
    }
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label="voice input"
      className={`shrink-0 rounded-card flex items-center justify-center ${listening ? 'bg-danger text-white animate-pulse' : 'bg-cream text-primary'} ${className}`}
      style={{ width: size, height: size, fontSize: 22 }}
    >
      🎤
    </button>
  )
}
