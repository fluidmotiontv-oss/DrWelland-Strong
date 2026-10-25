import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false
        },
        manifest: {
          name: 'Dr. Welland-Strong',
          short_name: 'Dr. Welland',
          description: 'The ultimate healer and complete holistic Star Trek style biometrics diagnosis, bodyfixer, mind care, and natural remedy advisor.',
          theme_color: '#030712',
          background_color: '#030712',
          display: 'standalone',
          icons: [
            {
              src: 'https://cdn.jsdelivr.net/gh/lucide-static/lucide@latest/icons/heart-pulse.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
