import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sales Orders PWA',
        short_name: 'SalesPWA',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
        start_url: '/',
        display: 'standalone',
        theme_color: '#1e40af'
      }
    })
  ]
});