import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use local sources instead of the installed packages
      '@remotion/player': path.resolve(__dirname, 'src/player/src'),
      remotion: path.resolve(__dirname, 'src/core/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@remotion/player', 'remotion'],
  },
})
