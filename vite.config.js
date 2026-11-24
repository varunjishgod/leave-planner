import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative paths, so the built site also works on GitHub Pages,
  // where it lives at https://<username>.github.io/leave-planner/ (not at the root).
  base: './',
})
