import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development' ? true : false, // Enable sourcemaps in development
    cssCodeSplit: true,
    target: 'es2020',
    minify: 'esbuild', // Use esbuild (default) instead of terser
    chunkSizeWarningLimit: 600, // Increase limit to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'chakra-ui': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          'vendor': ['axios', 'react-hook-form', 'react-icons', 'react-router-dom', 'stripe', 'zod'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  plugins: [
    visualizer({ 
      open: false, 
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
})
