// Emotion cache optimization for better CSS bundle management
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import React from 'react';

// Create optimized Emotion cache with better CSS extraction
export const createOptimizedEmotionCache = () => {
  return createCache({
    key: 'chakra',
    // Enable CSS extraction for better caching
    prepend: true,
    // Optimize for production builds
    speedy: process.env.NODE_ENV === 'production',
    // Custom insertion point for better CSS ordering
    insertionPoint: typeof document !== 'undefined'
      ? (document.querySelector('meta[name="emotion-insertion-point"]') as HTMLElement) || undefined
      : undefined,
  });
};

// Cache instance for the application
export const emotionCache = createOptimizedEmotionCache();

// Function to purge unused Emotion styles (DISABLED - was too aggressive)
export const purgeUnusedEmotionStyles = () => {
  // DISABLED: This function was removing critical CSS styles
  // Only enable for very specific debugging scenarios
  if (false && typeof document !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('CSS purging is disabled to prevent breaking styles');
  }
};

// Emotion cache provider component for better tree shaking
export const OptimizedEmotionCacheProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(CacheProvider, { value: emotionCache }, children);
};

// CSS-in-JS optimization utilities
export const cssOptimizations = {
  // Memoized style objects to prevent recreation
  memoizedStyles: new Map<string, any>(),

  // Get or create memoized style
  getMemoizedStyle: (key: string, styleFactory: () => any) => {
    if (!cssOptimizations.memoizedStyles.has(key)) {
      cssOptimizations.memoizedStyles.set(key, styleFactory());
    }
    return cssOptimizations.memoizedStyles.get(key);
  },

  // Clear memoized styles (useful for development)
  clearMemoizedStyles: () => {
    cssOptimizations.memoizedStyles.clear();
  },
};

// Production CSS optimization
export const optimizeProductionCSS = () => {
  if (process.env.NODE_ENV === 'production' && typeof document !== 'undefined') {
    // Remove development-only CSS
    const devStyles = document.querySelectorAll('style[data-dev-only]');
    devStyles.forEach(style => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });

    // Optimize CSS delivery
    const criticalStyles = document.querySelectorAll('style[data-critical]');
    criticalStyles.forEach(style => {
      style.setAttribute('media', 'all');
    });
  }
};