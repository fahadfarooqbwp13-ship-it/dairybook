import { create } from 'zustand'

// Transient toast for the "forgiveness" undo pattern (master prompt rule 5).
let timer = null
export const useToast = create((set) => ({
  toast: null, // { msg, undoable }
  show: (msg, undoable = false) => {
    clearTimeout(timer)
    set({ toast: { msg, undoable } })
    timer = setTimeout(() => set({ toast: null }), undoable ? 6000 : 2500)
  },
  hide: () => {
    clearTimeout(timer)
    set({ toast: null })
  },
}))
