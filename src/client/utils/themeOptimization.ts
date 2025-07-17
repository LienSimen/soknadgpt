// Theme optimization utilities for better CSS bundle management
import { theme } from '../theme';
import { preloadCriticalCSS, loadNonCriticalCSS } from './criticalCss';

// Theme optimization configuration
export const themeOptimizationConfig = {
  enableCriticalCss: false, // Temporarily disabled to fix alignment issues
  enableEmotionOptimization: true,
  enableProductionOptimizations: process.env.NODE_ENV === 'production',
  enableDevOptimizations: process.env.NODE_ENV === 'development',
};

// Initialize theme optimizations
export const initializeThemeOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Preload critical CSS for better performance
  if (themeOptimizationConfig.enableCriticalCss) {
    preloadCriticalCSS();
  }

  // Load non-critical CSS asynchronously
  if (themeOptimizationConfig.enableCriticalCss) {
    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loadNonCriticalCSS();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadNonCriticalCSS, 100);
    }
  }

  // Apply development optimizations (DISABLED - CSS purging was too aggressive)
  // CSS purging disabled to prevent breaking styles
  if (process.env.NODE_ENV === 'development') {
    console.log('[Theme] Development CSS optimizations available but disabled to prevent style removal');
  }
};

// Optimized theme tokens for tree shaking
export const getOptimizedThemeTokens = () => {
  // Extract only the tokens that are actually used
  const { colors, borders } = theme.semanticTokens;
  
  return {
    colors: {
      // Only include frequently used colors
      'bg-body': colors['bg-body'],
      'bg-contrast-xs': colors['bg-contrast-xs'],
      'bg-contrast-sm': colors['bg-contrast-sm'],
      'bg-contrast-md': colors['bg-contrast-md'],
      'bg-contrast-lg': colors['bg-contrast-lg'],
      'bg-overlay': colors['bg-overlay'],
      'bg-modal': colors['bg-modal'],
      'text-contrast-sm': colors['text-contrast-sm'],
      'text-contrast-md': colors['text-contrast-md'],
      'text-contrast-lg': colors['text-contrast-lg'],
      'border-contrast-xs': colors['border-contrast-xs'],
      'border-contrast-sm': colors['border-contrast-sm'],
      'border-contrast-md': colors['border-contrast-md'],
      'active': colors['active'],
    },
    borders,
  };
};

// CSS-in-JS optimization helpers
export const cssHelpers = {
  // Memoized style creator for frequently used styles
  createMemoizedStyle: (key: string, styleObject: any) => {
    const memoKey = `theme-${key}`;
    if (!cssHelpers.styleCache.has(memoKey)) {
      cssHelpers.styleCache.set(memoKey, styleObject);
    }
    return cssHelpers.styleCache.get(memoKey);
  },

  // Style cache for memoization
  styleCache: new Map<string, any>(),

  // Common optimized styles
  commonStyles: {
    // Frequently used card style
    card: {
      bgColor: 'bg-contrast-xs',
      border: 'sm',
      rounded: 'lg',
    },
    
    // Frequently used button style
    primaryButton: {
      border: 'sm',
      bgColor: 'purple.400',
      color: 'white',
      _hover: { bg: 'purple.500' },
      _focus: { boxShadow: 'none', borderColor: 'active' },
      transition: 'all 0.2s',
    },
    
    // Frequently used input style
    primaryInput: {
      border: 'sm',
      borderColor: 'border-contrast-xs',
      bg: 'bg-contrast-xs',
      color: 'text-contrast-lg',
      _hover: {
        bg: 'bg-contrast-md',
        borderColor: 'border-contrast-md',
      },
      _focus: {
        boxShadow: 'none',
        borderColor: 'active',
      },
    },
  },

  // Clear style cache (useful for development)
  clearStyleCache: () => {
    cssHelpers.styleCache.clear();
  },
};

// Performance monitoring for theme optimizations
export const themePerformanceMonitor = {
  // Track CSS loading performance
  trackCssLoadTime: (startTime: number, cssType: 'critical' | 'non-critical') => {
    const loadTime = performance.now() - startTime;
    console.log(`${cssType} CSS loaded in ${loadTime.toFixed(2)}ms`);
    
    // Report to performance monitoring if available
    if ('PerformanceObserver' in window) {
      // This would integrate with your performance monitoring system
      console.log(`Theme ${cssType} CSS performance:`, {
        loadTime,
        timestamp: Date.now(),
      });
    }
  },

  // Monitor Emotion cache size
  monitorEmotionCacheSize: () => {
    if (typeof document !== 'undefined') {
      const emotionStyles = document.querySelectorAll('style[data-emotion]');
      const totalSize = Array.from(emotionStyles).reduce((size, style) => {
        return size + (style.textContent?.length || 0);
      }, 0);
      
      console.log(`Emotion cache size: ${(totalSize / 1024).toFixed(2)}KB`);
      return totalSize;
    }
    return 0;
  },
};

// Create a simple emotion cache placeholder since the actual cache is managed by Chakra UI
const emotionCache = {
  key: 'chakra',
  stylisPlugins: [],
};

// Export theme optimization hook for React components
export const useThemeOptimization = () => {
  return {
    emotionCache,
    commonStyles: cssHelpers.commonStyles,
    createMemoizedStyle: cssHelpers.createMemoizedStyle,
    optimizedTokens: getOptimizedThemeTokens(),
  };
};