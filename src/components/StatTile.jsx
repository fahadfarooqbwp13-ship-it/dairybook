import { useNavigate } from 'react-router-dom'

// Big home-screen summary tile: emoji + large number + Urdu label.
export default function StatTile({ icon, value, label, accent = '#0277BD', to }) {
  const nav = useNavigate()
  return (
    <button
      onClick={() => to && nav(to)}
      className="gs-card p-3 text-start active:scale-[0.98] transition-transform"
      style={{ borderInlineStart: `6px solid ${accent}` }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ fontSize: 28 }} className="shrink-0">{icon}</span>
        <span className="num text-2xl font-bold text-ink leading-none truncate">{value}</span>
      </div>
      <div className="font-urdu text-lg text-muted mt-1.5 leading-tight break-words">{label}</div>
    </button>
  )
}
