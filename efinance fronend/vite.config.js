import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  },
  server: {
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    include: ['axios'] // Explicitly include axios
  },
})
