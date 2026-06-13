import { create } from 'zustand'

// Which record the generic editor is editing (collection + id), if any.
export const useEditor = create((set) => ({
  editing: null, // { collection, id }
  open: (collection, id) => set({ editing: { collection, id } }),
  close: () => set({ editing: null }),
}))

// Promise-based confirm dialog (in-app overlay — no native popup, TWA-safe).
export const useConfirm = create((set, get) => ({
  dialog: null, // { title, message, confirmLabel, danger, requireText, resolve }
  confirm: (opts) => new Promise((resolve) => set({ dialog: { ...opts, resolve } })),
  _resolve: (val) => {
    const d = get().dialog
    if (d) d.resolve(val)
    set({ dialog: null })
  },
}))
