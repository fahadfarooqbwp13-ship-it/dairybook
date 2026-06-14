// Voice input is disabled — the Android WebView (wrapped app) doesn't support
// the SpeechRecognition API, so the button is a no-op and renders nothing.
// Kept as a component so existing call sites don't break.
export default function VoiceButton() {
  return null
}
