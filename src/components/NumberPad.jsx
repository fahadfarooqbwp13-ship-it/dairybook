// Calculator-style number pad — no keyboard needed. Big 56dp+ keys.
// Controlled: parent owns the string value.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export default function NumberPad({ value, onChange, allowDecimal = true }) {
  const press = (k) => {
    if (k === '⌫') return onChange(value.slice(0, -1))
    if (k === '.') {
      if (!allowDecimal || value.includes('.')) return
      return onChange(value === '' ? '0.' : value + '.')
    }
    // one decimal place; allow large amounts (up to 9 digits ~ hundreds of millions)
    if (value.includes('.') && value.split('.')[1].length >= 1) return
    if (value.replace('.', '').length >= 9) return
    const next = value === '0' && k !== '.' ? k : value + k
    onChange(next)
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => press(k)}
          disabled={k === '.' && !allowDecimal}
          className={`gs-touch num text-2xl font-bold rounded-card active:scale-95 transition
            ${k === '⌫' ? 'bg-cream text-accent' : 'bg-white text-ink'} shadow-card
            disabled:opacity-30`}
          style={{ height: 60 }}
        >
          {k}
        </button>
      ))}
    </div>
  )
}
