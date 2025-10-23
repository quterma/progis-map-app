import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wms': {
        target: 'https://ahocevar.com/geoserver/wms',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/wms/, ''),
      },
    },
  },
});
