import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5181 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
});
