import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  base:
    process.env.VITE_BASE_PATH ||
    (command === 'build' || isPreview ? '/scottsiegel/' : '/'),
  plugins: [react()],
}))
