// IndexedDB archive of generated bill PNGs — one per buyer per month, kept
// forever (never auto-deleted), fully available offline.
const DB_NAME = 'dairybook'
const STORE = 'bills'
const VERSION = 1

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' })
        os.createIndex('buyerId', 'buyerId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const billId = (buyerId, year, month) => `${buyerId}_${year}_${String(month).padStart(2, '0')}`

export async function saveBill(rec) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(rec)
    tx.oncomplete = () => resolve(rec)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getBill(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const r = tx.objectStore(STORE).get(id)
    r.onsuccess = () => resolve(r.result || null)
    r.onerror = () => reject(r.error)
  })
}

export async function getBillsForBuyer(buyerId) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const idx = tx.objectStore(STORE).index('buyerId')
    const r = idx.getAll(buyerId)
    r.onsuccess = () => resolve(r.result || [])
    r.onerror = () => reject(r.error)
  })
}
