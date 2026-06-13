// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plain Vite build — no vite-plugin-pwa (it pulls in workbox-build, whose
// dynamic require() breaks on some cloud CI runners). Offline support is
// provided by a hand-written service worker in public/sw.js + a static
// public/manifest.webmanifest, so the build has zero workbox dependency.
export default defineConfig({
  plugins: [react()],
  // allow access through an HTTPS dev tunnel (trycloudflare/ngrok host headers)
  server: { host: true, allowedHosts: true },
  preview: { host: true, port: 4174, allowedHosts: true },
})
