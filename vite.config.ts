import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import type { OutputBundle, OutputChunk, OutputAsset } from 'rollup'

// Performance budget configuration (target < 500 KiB total)
const PERFORMANCE_BUDGETS = {
  maxBundleSize: 500 * 1024, // 500 KiB in bytes
  maxChunkSize: 200 * 1024,  // 200 KiB per chunk
  maxAssetSize: 100 * 1024,  // 100 KiB per asset
  warningThreshold: 0.8,     // Warn at 80% of budget
}

// Bundle size monitoring function
function checkBundleSize(bundle: OutputBundle) {
  const bundleSize = Object.values(bundle).reduce((total: number, chunk) => {
    return total + (chunk.type === 'chunk' ? (chunk as OutputChunk).code.length : 0)
  }, 0)

  const budgetUsage = bundleSize / PERFORMANCE_BUDGETS.maxBundleSize

  if (budgetUsage > 1) {
    console.error(`❌ Bundle size exceeded! ${(bundleSize / 1024).toFixed(1)} KiB > ${PERFORMANCE_BUDGETS.maxBundleSize / 1024} KiB`)
    if (process.env.CI) {
      process.exit(1) // Fail CI build if budget exceeded
    }
  } else if (budgetUsage > PERFORMANCE_BUDGETS.warningThreshold) {
    console.warn(`⚠️  Bundle size warning: ${(bundleSize / 1024).toFixed(1)} KiB (${(budgetUsage * 100).toFixed(1)}% of budget)`)
  } else {
    console.log(`✅ Bundle size OK: ${(bundleSize / 1024).toFixed(1)} KiB (${(budgetUsage * 100).toFixed(1)}% of budget)`)
  }

  return bundleSize
}

// Bundle analysis plugin
function bundleAnalysisPlugin() {
  return {
    name: 'bundle-analysis',
    async generateBundle(_options: any, bundle: OutputBundle) {
      // Check individual chunk sizes against budget
      let chunkSizeExceeded = false;
      Object.entries(bundle).forEach(([fileName, chunk]) => {
        if (chunk.type === 'chunk') {
          const outputChunk = chunk as OutputChunk
          const chunkSize = outputChunk.code.length
          if (chunkSize > PERFORMANCE_BUDGETS.maxChunkSize) {
            console.error(`❌ Chunk size exceeded: ${fileName} (${(chunkSize / 1024).toFixed(1)} KiB > ${PERFORMANCE_BUDGETS.maxChunkSize / 1024} KiB)`)
            chunkSizeExceeded = true;
          } else if (chunkSize > PERFORMANCE_BUDGETS.maxChunkSize * PERFORMANCE_BUDGETS.warningThreshold) {
            console.warn(`⚠️  Large chunk warning: ${fileName} (${(chunkSize / 1024).toFixed(1)} KiB)`)
          }
        }
      })
      if (chunkSizeExceeded) {
        throw new Error('One or more chunks exceeded the maximum allowed size. Build failed.');
      }

      // Check total bundle size
      checkBundleSize(bundle)

      // Generate bundle analysis report
      const bundleReport = {
        timestamp: new Date().toISOString(),
        totalSize: Object.values(bundle).reduce((total: number, chunk) => {
          return total + (chunk.type === 'chunk' ? (chunk as OutputChunk).code.length : 0)
        }, 0),
        chunks: Object.entries(bundle).map(([name, chunk]) => ({
          name,
          size: chunk.type === 'chunk' ? (chunk as OutputChunk).code.length : 0,
          type: chunk.type,
        })),
        budgetStatus: {
          maxBundleSize: PERFORMANCE_BUDGETS.maxBundleSize,
          maxChunkSize: PERFORMANCE_BUDGETS.maxChunkSize,
          warningThreshold: PERFORMANCE_BUDGETS.warningThreshold,
        }
      }

      // Write bundle report for CI/CD analysis
      if (process.env.NODE_ENV === 'production' || process.env.CI) {
        try {
          // Use this.emitFile to write the bundle report instead of fs
          this.emitFile({
            type: 'asset',
            fileName: 'bundle-report.json',
            source: JSON.stringify(bundleReport, null, 2)
          })
          console.log('📊 Bundle analysis report generated: bundle-report.json')
        } catch (error) {
          console.warn('Could not write bundle report:', error)
        }
      }
    },
  }
}

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development' ? true : false, // Enable sourcemaps in development
    cssCodeSplit: false, // Disable CSS code splitting to prevent loading issues
    cssMinify: 'esbuild', // Use esbuild for CSS minification
    target: 'es2020',
    minify: 'esbuild', // Use esbuild (default) instead of terser
    chunkSizeWarningLimit: PERFORMANCE_BUDGETS.maxChunkSize / 1024, // Dynamic limit based on budget
    rollupOptions: {
      // Enhanced tree shaking configuration
      treeshake: {
        moduleSideEffects: (id: string) => /\.css$/i.test(id), // Only preserve side effects for CSS files
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        // Targeted manual chunking: group vendor dependencies separately
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`
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
      // Additional rollup options for better optimization
      external: [],
      onwarn(warning, warn) {
        // Enhanced warning system for bundle size monitoring
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          console.warn(`Circular dependency detected: ${warning.message}`)
        }
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
          console.warn(`Unused external import: ${warning.message}`)
        }
        if (warning.code === 'LARGE_BUNDLE') {
          console.warn(`Large bundle detected: ${warning.message}`)
        }
        warn(warning)
      },

    },
  },
  plugins: [
    // Bundle analysis plugin for performance monitoring
    bundleAnalysisPlugin(),
    // Bundle visualizer for detailed analysis
    visualizer({
      open: false,
      filename: 'bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Better visualization for chunk analysis
      title: 'Bundle Analysis - Performance Budget Report',
    }),
    // Additional detailed visualizer for CI/CD integration
    ...(process.env.ANALYZE_BUNDLE ? [
      visualizer({
        open: false,
        filename: 'bundle-analyzer-detailed.html',
        template: 'sunburst', // Different template for detailed analysis
        gzipSize: true,
        brotliSize: true,
        title: 'Detailed Bundle Analysis for CI/CD',
      })
    ] : []),
  ],
  css: {
    // CSS optimization for better performance
    devSourcemap: process.env.NODE_ENV === 'development',
    preprocessorOptions: {
      // Optimize CSS processing
    },
    postcss: {
      plugins: [
        // Add autoprefixer for better browser compatibility
        // Note: These would need to be installed as dependencies
        // 'autoprefixer',
        // 'cssnano' for production minification
      ],
    },
  },
  // Optimization for better tree shaking
  define: {
    // Remove __DEV__ definition to avoid conflicts with Chakra UI
  },
  esbuild: {
    // Enhanced tree shaking for unused code elimination
    treeShaking: true,
    legalComments: 'none',
    // Only remove debugger statements, keep console for error reporting
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
  },
})
