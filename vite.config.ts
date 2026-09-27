import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// A robust custom PWA plugin fully supported by Rollup and Rolldown with zero bundle-assignment issues
function CustomPWAPlugin() {
  return {
    name: 'custom-pwa-plugin',
    generateBundle(this: any) {
      // Emit manifest.webmanifest
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify({
          name: 'GOYE SERVICES HUB',
          short_name: 'GOYE HUB',
          description: 'CAC Services • Websites • AI Bots • Digital Business Solutions',
          theme_color: '#000000',
          background_color: '#000000',
          start_url: '/',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }, null, 2)
      });

      // Emit sw.js (Service Worker)
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `
          const CACHE_NAME = 'goye-hub-cache-v1';
          self.addEventListener('install', (event) => {
            event.waitUntil(caches.open(CACHE_NAME));
          });
          self.addEventListener('fetch', (event) => {
            event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
          });
        `
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      CustomPWAPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 5173,
      host: true
    }
  };
});
