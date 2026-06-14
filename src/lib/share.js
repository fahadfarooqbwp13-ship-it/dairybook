// Share a PNG via the Web Share API (opens the Android share sheet → WhatsApp,
// with the image attached). Falls back to a device download when file-sharing
// isn't supported. TWA/PWA-safe: no window.open / popups.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    a.remove()
    URL.revokeObjectURL(url)
  }, 2000)
}

// Returns 'shared' | 'cancelled' | 'downloaded'
export async function shareImage(blob, filename, { title, text } = {}) {
  try {
    const file = new File([blob], filename, { type: 'image/png' })
    // Prefer files-only payload — combining files+text is rejected on some
    // Android/Chrome builds and silently fails, which is the "does nothing" bug.
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return 'shared'
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled'
        // some platforms only share when title/text included — try once more
        try {
          await navigator.share({ files: [file], title, text })
          return 'shared'
        } catch (e2) {
          if (e2 && e2.name === 'AbortError') return 'cancelled'
        }
      }
    }
  } catch {
    /* fall through to download */
  }
  downloadBlob(blob, filename)
  return 'downloaded'
}
