import { useEditor } from '../store/useEditor.js'

// Small pencil button placed on any record row → opens the generic editor
// (which itself offers Save + Delete). Stops propagation so row taps still work.
export default function EditBtn({ collection, id, className = '' }) {
  const open = useEditor((s) => s.open)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        open(collection, id)
      }}
      aria-label="edit"
      className={`shrink-0 rounded-full flex items-center justify-center text-muted active:bg-black/5 ${className}`}
      style={{ width: 40, height: 40, fontSize: 18 }}
    >
      ✏️
    </button>
  )
}
