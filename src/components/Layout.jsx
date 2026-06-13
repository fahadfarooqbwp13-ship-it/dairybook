import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import RecordEditor from './RecordEditor.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { useToast } from '../store/useToast.js'
import { useStore } from '../store/useStore.js'
import { useT } from '../i18n/useT.js'

// App shell: a phone-width column, scrollable content, fixed bottom nav,
// and a single undo toast layered on top.
export default function Layout() {
  const { toast, hide } = useToast()
  const undo = useStore((s) => s.undo)
  const { t } = useT()

  return (
    <div className="mx-auto max-w-md h-full flex flex-col bg-cream relative overflow-hidden">
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>

      <BottomNav />

      <RecordEditor />
      <ConfirmDialog />

      {toast && (
        <div className="absolute inset-x-0 bottom-20 px-4 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-ink text-white rounded-card shadow-lg px-4 py-3 flex items-center gap-4 min-w-[80%]">
            <span className="font-urdu text-lg flex-1">{toast.msg}</span>
            {toast.undoable && (
              <button
                onClick={() => {
                  undo()
                  hide()
                }}
                className="font-urdu text-lg font-bold text-gold active:opacity-70"
              >
                {t('undo')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
