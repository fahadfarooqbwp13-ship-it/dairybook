// Share a PNG via the Web Share API (opens WhatsApp etc. with the image
// attached). Falls back to a device download when sharing files isn't
// supported. TWA-safe: no window.open / popups.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function shareImage(blob, filename, { title, text } = {}) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled'
      // otherwise fall through to download
    }
  }
  downloadBlob(blob, filename)
  return 'downloaded'
}
