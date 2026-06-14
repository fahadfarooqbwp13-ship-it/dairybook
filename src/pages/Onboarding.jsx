import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useT } from '../i18n/useT.js'
import VoiceButton from '../components/VoiceButton.jsx'

// Simple 3-step first-run setup (shown when onboarded === false, e.g. after
// "new farm"). Big buttons, minimal reading, voice for the farm name.
export default function Onboarding() {
  const nav = useNavigate()
  const { lang } = useT()
  const toggleLang = useStore((s) => s.toggleLang)
  const setFarm = useStore((s) => s.setFarm)
  const setOnboarded = useStore((s) => s.setOnboarded)
  const resetDemo = useStore((s) => s.resetDemo)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  function finish(go) {
    setFarm(name.trim() || 'میرا فارم', '')
    if (go) nav(go)
    setOnboarded(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-cream overflow-y-auto">
      <div className="mx-auto max-w-md min-h-full flex flex-col px-6 py-8">
        {/* progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i === step ? 'bg-primary' : 'bg-black/15'}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="rounded-full bg-primary/10 flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <span style={{ fontSize: 64 }}>🐄</span>
            </div>
            <div className="font-urdu text-3xl font-bold text-primary">ڈیری بک میں خوش آمدید</div>
            <div className="font-urdu text-lg text-muted leading-relaxed">آپ کا ذہین فارم مددگار — دودھ، جانور، خریدار اور حساب کتاب ایک ہی جگہ</div>
            <button onClick={toggleLang} className="gs-btn bg-white text-primary border-2 border-primary/20 px-6 mt-2">
              🌐 {lang === 'ur' ? 'English' : 'اردو'}
            </button>
            <button onClick={() => setStep(1)} className="gs-btn bg-primary text-white w-full text-2xl mt-2">آگے ›</button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="font-urdu text-2xl font-bold text-center">آپ کے فارم کا نام؟</div>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="gs-input font-urdu flex-1 text-2xl" placeholder="مثلاً میرا ڈیری فارم" autoFocus />
              <VoiceButton onResult={setName} lang={lang} />
            </div>
            <button onClick={() => setStep(2)} className="gs-btn bg-primary text-white w-full text-2xl mt-2">آگے ›</button>
            <button onClick={() => setStep(0)} className="font-urdu text-muted">‹ واپس</button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <span style={{ fontSize: 56 }}>🎉</span>
            <div className="font-urdu text-2xl font-bold text-primary">فارم تیار ہے!</div>
            <div className="font-urdu text-lg text-muted leading-relaxed">اب اپنا پہلا جانور شامل کریں — یا پہلے ڈیمو دیکھیں</div>
            <button onClick={() => finish('/animals/new')} className="gs-btn bg-ok text-white w-full text-2xl mt-2">🐄 پہلا جانور شامل کریں</button>
            <button onClick={() => finish('/')} className="gs-btn bg-white text-primary border-2 border-primary/20 w-full">بعد میں — ہوم پر جائیں</button>
            <button onClick={() => { resetDemo() }} className="font-urdu text-sm text-muted mt-1">یا ڈیمو ڈیٹا سے سیکھیں</button>
          </div>
        )}
      </div>
    </div>
  )
}
