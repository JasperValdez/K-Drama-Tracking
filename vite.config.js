import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include all your icons here so they work offline!
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'], 
      manifest: {
        name: 'KD-PRO Vault',
        short_name: 'KD-PRO',
        description: 'My Personal K-Drama Vault',
        // splash screen background (slate-950)
        background_color: '#020617', 
        // status bar/top notch color (pink-600)
        theme_color: '#db2777',     
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Best for Android splash screens
          }
        ]
      }
    })
  ]
})