// Google Drive backup via Google Identity Services (GSI) token model — no
// backend. Backups go to the app's private Drive appDataFolder (drive.file
// scope), so the app only ever sees its own file. Needs a Google OAuth Client
// ID (Web), which the user creates once in Google Cloud Console and pastes in
// Settings — stored locally below.
const CID_KEY = 'dairybook-gclient'
const FILE_NAME = 'dairybook-backup.json'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

let accessToken = null

export const getClientId = () => localStorage.getItem(CID_KEY) || ''
export const setClientId = (id) => localStorage.setItem(CID_KEY, (id || '').trim())
export const isConfigured = () => !!getClientId()
export const hasToken = () => !!accessToken

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const existing = document.getElementById('gsi-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('gsi-load')))
      return
    }
    const sc = document.createElement('script')
    sc.id = 'gsi-script'
    sc.src = 'https://accounts.google.com/gsi/client'
    sc.async = true
    sc.defer = true
    sc.onload = () => resolve()
    sc.onerror = () => reject(new Error('gsi-load'))
    document.head.appendChild(sc)
  })
}

// trigger Google sign-in / consent and obtain an access token
export async function signIn() {
  const clientId = getClientId()
  if (!clientId) throw new Error('no-client-id')
  await loadGsi()
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp && resp.access_token) {
          accessToken = resp.access_token
          resolve(accessToken)
        } else {
          reject(new Error(resp?.error || 'auth-failed'))
        }
      },
    })
    client.requestAccessToken({ prompt: '' })
  })
}

async function token() {
  return accessToken || (await signIn())
}

async function findBackupId(tk) {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const r = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,modifiedTime)&q=${q}`, {
    headers: { Authorization: 'Bearer ' + tk },
  })
  const j = await r.json()
  return j.files && j.files[0] ? j.files[0].id : null
}

// upload (create or overwrite) the backup JSON
export async function uploadBackup(jsonString) {
  const tk = await token()
  const id = await findBackupId(tk)
  const blob = new Blob([jsonString], { type: 'application/json' })
  if (id) {
    const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' },
      body: blob,
    })
    if (!r.ok) throw new Error('upload-failed')
  } else {
    const metadata = { name: FILE_NAME, parents: ['appDataFolder'] }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)
    const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tk },
      body: form,
    })
    if (!r.ok) throw new Error('upload-failed')
  }
}

// fetch the latest backup JSON string from Drive
export async function downloadBackup() {
  const tk = await token()
  const id = await findBackupId(tk)
  if (!id) throw new Error('no-backup')
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: 'Bearer ' + tk },
  })
  if (!r.ok) throw new Error('download-failed')
  return r.text()
}
