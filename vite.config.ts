import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['socket.io-client', 'react-router-dom', 'react', 'react-dom', '@tanstack/react-query-devtools', '@/lib/market-data', '@/lib/technical-indicators', '@/lib/utils']
    }
  }
})
