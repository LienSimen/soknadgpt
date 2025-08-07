import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    minify: 'esbuild', // Changed from 'terser' to 'esbuild'
    rollupOptions: {
      output: {
        // Optimized chunking for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@chakra-ui/icons'],
          'form-vendor': ['react-hook-form'],
          'router-vendor': ['react-router-dom'],
        }
      },
    },
  },
  esbuild: {
    // Keep function names to prevent minification issues
    keepNames: true,
    // Only drop console in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      'react-hook-form',
      'react-router-dom'
    ]
  },
  plugins: [],
})