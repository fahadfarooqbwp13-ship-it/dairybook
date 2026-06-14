// Local reminder notifications. True background delivery (app fully closed)
// needs push infrastructure, which a no-backend PWA can't do reliably; so we
// fire due reminders whenever the app is opened/focused on or after their date,
// plus in-session. This covers the farmer's real need without a server.
export async function ensureNotifyPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const p = await Notification.requestPermission()
    return p === 'granted'
  } catch {
    return false
  }
}

export function fireNotification(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, { body, icon: '/favicon.svg', badge: '/favicon.svg' }))
        .catch(() => new Notification(title, { body }))
    } else {
      new Notification(title, { body })
    }
  } catch {
    /* ignore */
  }
}

// fire any reminder whose date has arrived and hasn't been notified yet
export function checkDueAlerts(alerts, markNotified) {
  const today = new Date().toISOString().slice(0, 10)
  ;(alerts || [])
    .filter((a) => !a.notified && a.date <= today)
    .forEach((a) => {
      fireNotification('ڈیری بک یاد دہانی 🔔', a.text || 'آج کی یاد دہانی')
      markNotified(a.id)
    })
}
