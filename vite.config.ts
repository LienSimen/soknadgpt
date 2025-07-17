import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        // Simplified chunking - let Vite handle it automatically
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  plugins: [],
})
