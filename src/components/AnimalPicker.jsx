import AnimalAvatar from './AnimalAvatar.jsx'

// Consistent horizontal photo-grid animal picker (replaces text dropdowns).
// Better for low-literacy users than a <select>.
export default function AnimalPicker({ animals, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {animals.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onChange(a.id)}
          className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl ${value === a.id ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
          style={{ width: 64 }}
        >
          <AnimalAvatar animal={a} size={46} showTag={false} />
          <span className="num text-xs font-bold text-ink">{a.tag}</span>
        </button>
      ))}
    </div>
  )
}
