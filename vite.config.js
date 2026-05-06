import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` doit correspondre au nom du repo pour GitHub Pages
// (https://inle45.github.io/Albion/). En dev local, base = '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Albion/' : '/',
  server: { port: 5173, host: true },
}))
