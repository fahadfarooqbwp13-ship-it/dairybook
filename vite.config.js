// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Installable, offline-capable PWA for budget Android phones.
// Google Fonts (Nastaliq/Nunito/Roboto Mono) are runtime-cached so the
// Urdu typography survives offline after the first load.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ڈیری بک — DairyBook',
        short_name: 'DairyBook',
        description: 'آپ کا ڈیجیٹل فارم مددگار — Pakistani dairy & cattle farm manager',
        lang: 'ur',
        dir: 'rtl',
        theme_color: '#1B5E20',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  // allow access through the HTTPS dev tunnel (trycloudflare/ngrok host headers)
  server: { host: true, allowedHosts: true },
  preview: { host: true, port: 4174, allowedHosts: true },
})
