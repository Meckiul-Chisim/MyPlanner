// Purpose: Configure Electron main/preload builds and the Tailwind-powered React renderer.
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve('electron/main.ts'),
        external: ['better-sqlite3'],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve('electron/preload.ts'),
        output: {
          format: 'cjs',
          entryFileNames: 'preload.cjs',
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: resolve(process.cwd()),
    build: {
      rollupOptions: {
        input: resolve('index.html'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
})