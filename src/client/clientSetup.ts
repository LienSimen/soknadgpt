import { configureQueryClient } from "wasp/client/operations";
import { performanceMonitor, trackWebVitals } from "./utils/performanceMonitor";
import { initializeThemeOptimizations, themePerformanceMonitor } from "./utils/themeOptimization";
import { loadNonCriticalCSS, optimizeEmotionCache, addCSSPreloadHints } from "./utils/criticalCss";
import { initializeFontOptimization, fontPerformanceMonitor } from "./utils/fontOptimization";
import { initializeImageOptimization, imagePerformanceMonitor } from "./utils/imageOptimization";
import { initializeSecurityMonitoring, securityMonitor } from "./utils/securityMonitor";

// Service Worker registration with feature detection
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('[SW] Service worker registered successfully:', registration.scope);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('[SW] New service worker available');
              // Could show update notification to user
            }
          });
        }
      });
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[SW] Cache updated:', event.data.url);
        }
      });
      
      return registration;
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[SW] Service worker disabled in development mode');
  } else {
    console.log('[SW] Service worker not supported');
  }
}

export default async function mySetupFunction() {
  configureQueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 minutes - auth data is considered fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry auth failures to avoid console spam
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Only retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        onError: (error: any) => {
          // Suppress expected authentication errors from console
          if (error?.status === 401 || error?.status === 403) {
            // Don't log 401/403 errors as they're expected for unauthenticated users
            return;
          }
          // Suppress network errors that are expected in offline scenarios
          if (error?.message?.includes('NetworkError') || 
              error?.message?.includes('Failed to fetch')) {
            console.warn('[API] Network error (expected in offline mode):', error.message);
            return;
          }
          // Log other errors normally
          console.error('[API] Unexpected error:', error);
        },
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry auth failures
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Only retry up to 1 time for mutations to avoid duplicate operations
          return failureCount < 1;
        },
        retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000), // Longer delay for mutations
        onError: (error: any) => {
          // Same error handling as queries
          if (error?.status === 401 || error?.status === 403) {
            return;
          }
          if (error?.message?.includes('NetworkError') || 
              error?.message?.includes('Failed to fetch')) {
            console.warn('[API] Mutation network error:', error.message);
            return;
          }
          console.error('[API] Mutation error:', error);
        },
      },
    },
  });

  // Register service worker for offline caching and prefetching
  await registerServiceWorker();

  // Load non-critical CSS asynchronously to avoid render blocking
  loadNonCriticalCSS();
  
  // Add CSS preload hints for important stylesheets
  addCSSPreloadHints();

  // Initialize font optimization for Google Fonts caching and fallbacks
  await initializeFontOptimization();

  // Initialize image optimization for lazy loading and accessibility
  initializeImageOptimization();

  // Initialize security monitoring and HTTPS enforcement
  initializeSecurityMonitoring();

  // Initialize theme optimizations for better CSS performance
  const themeOptStartTime = performance.now();
  initializeThemeOptimizations();
  themePerformanceMonitor.trackCssLoadTime(themeOptStartTime, 'critical');

  // Initialize performance monitoring
  trackWebVitals((metrics) => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Metrics]', metrics);
    }
    
    // In production, you could send metrics to an analytics service
    // Example: sendToAnalytics(metrics);
    
    // Send performance metrics to service worker for potential caching decisions
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_METRICS',
        metrics: metrics
      });
    }
  });

  // Log performance summary after a short delay to ensure all metrics are captured
  setTimeout(() => {
    if (process.env.NODE_ENV === 'development') {
      performanceMonitor.logPerformanceSummary();
      // Monitor theme performance in development
      themePerformanceMonitor.monitorEmotionCacheSize();
    }
    
    // Optimize Emotion cache by removing unused styles
    optimizeEmotionCache();
  }, 2000);
}
