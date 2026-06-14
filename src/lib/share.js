// Share a PNG so it actually opens the Android share sheet → WhatsApp.
// In the wrapped Capacitor app the Android WebView does NOT support the Web
// Share API for files, so we use the native Share plugin (writing the file to
// the cache first). In a plain browser PWA we use the Web Share API, falling
// back to a download.
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'

const isNative = () => {
  try {
    return Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve(String(r.result).split(',')[1] || '')
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

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

// Generic: share any file (image, JSON backup, …) via the native/Web share
// sheet so the user can pick WhatsApp, Google Drive, etc.
// Returns 'shared' | 'cancelled' | 'downloaded'
export async function shareFile(blob, filename, mime = 'application/octet-stream', { title, text } = {}) {
  const safeName = (filename || 'dairybook').replace(/[^a-zA-Z0-9._-]/g, '_')

  // --- Native Capacitor app: write file, then native share sheet ---
  if (isNative()) {
    try {
      const base64 = await blobToBase64(blob)
      await Filesystem.writeFile({ path: safeName, data: base64, directory: Directory.Cache })
      const { uri } = await Filesystem.getUri({ path: safeName, directory: Directory.Cache })
      await Share.share({ title: title || 'DairyBook', text: text || '', files: [uri] })
      return 'shared'
    } catch (e) {
      if (/cancel/i.test((e && e.message) || '')) return 'cancelled'
      // fall through to web/download
    }
  }

  // --- Browser PWA: Web Share API with files (files-only first for reliability) ---
  try {
    const file = new File([blob], safeName, { type: mime })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return 'shared'
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled'
        try {
          await navigator.share({ files: [file], title, text })
          return 'shared'
        } catch (e2) {
          if (e2 && e2.name === 'AbortError') return 'cancelled'
        }
      }
    }
  } catch {
    /* fall through */
  }

  downloadBlob(blob, filename || safeName)
  return 'downloaded'
}

// Image convenience wrapper (bills, reports, summaries).
export function shareImage(blob, filename, opts = {}) {
  return shareFile(blob, filename || 'dairybook.png', 'image/png', opts)
}
