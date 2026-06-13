import { useState } from 'react'
import { useConfirm } from '../store/useEditor.js'
import { useT } from '../i18n/useT.js'

// Renders the active confirm dialog as an in-app overlay (no native popup).
export default function ConfirmDialog() {
  const { dialog, _resolve } = useConfirm()
  const { t } = useT()
  const [typed, setTyped] = useState('')
  if (!dialog) return null

  const needText = dialog.requireText
  const canConfirm = !needText || typed === needText

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end" onClick={() => _resolve(false)}>
      <div
        className="bg-surface rounded-t-3xl w-full p-5 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-urdu text-2xl font-bold text-ink mb-2">{dialog.title}</div>
        {dialog.message && <div className="font-urdu text-lg text-muted leading-relaxed mb-3">{dialog.message}</div>}

        {needText && (
          <div className="mb-3">
            <div className="font-urdu text-base text-muted mb-1">
              تصدیق کے لیے <span className="num font-bold text-danger">{needText}</span> لکھیں
            </div>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="gs-input num text-center"
              placeholder={needText}
              autoFocus
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => { setTyped(''); _resolve(false) }} className="gs-btn bg-white text-muted border-2 border-black/10">
            {t('cancel')}
          </button>
          <button
            onClick={() => { setTyped(''); _resolve(true) }}
            disabled={!canConfirm}
            className={`gs-btn text-white disabled:opacity-40 ${dialog.danger ? 'bg-danger' : 'bg-ok'}`}
          >
            {dialog.confirmLabel || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
