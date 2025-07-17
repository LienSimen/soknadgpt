// Critical CSS extraction and optimization utilities
// This module helps identify and inline critical CSS for above-the-fold content

export const CRITICAL_CSS = `
/* Critical CSS for above-the-fold content */
/* Base styles that prevent layout shift */
html {
  font-size: 90%;
}

@media (min-width: 768px) {
  html {
    font-size: 100%;
  }
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  background-color: white;
  color: rgba(0, 0, 0, 0.9);
  line-height: 1.5;
}

/* Critical layout styles to prevent CLS */
.chakra-ui-light {
  --chakra-colors-bg-body: white;
  --chakra-colors-bg-contrast-xs: rgba(0, 30, 50, 0.025);
  --chakra-colors-bg-contrast-sm: rgba(0, 30, 50, 0.05);
  --chakra-colors-bg-contrast-md: rgba(0, 30, 50, 0.075);
  --chakra-colors-text-contrast-sm: rgba(0, 0, 0, 0.7);
  --chakra-colors-text-contrast-md: rgba(0, 0, 0, 0.8);
  --chakra-colors-text-contrast-lg: rgba(0, 0, 0, 0.9);
  --chakra-colors-border-contrast-xs: rgba(0, 0, 0, 0.2);
  --chakra-colors-active: #B794F6;
}

.chakra-ui-dark {
  --chakra-colors-bg-body: rgba(0, 0, 0, 0.50);
  --chakra-colors-bg-contrast-xs: rgba(255, 255, 255, 0.0125);
  --chakra-colors-bg-contrast-sm: rgba(255, 255, 255, 0.025);
  --chakra-colors-bg-contrast-md: rgba(255, 255, 255, 0.05);
  --chakra-colors-text-contrast-sm: rgba(255, 255, 255, 0.6);
  --chakra-colors-text-contrast-md: rgba(255, 255, 255, 0.7);
  --chakra-colors-text-contrast-lg: rgba(255, 255, 255, 0.8);
  --chakra-colors-border-contrast-xs: rgba(255, 255, 255, 0.1);
  --chakra-colors-active: #B794F6;
}

/* Critical button styles for immediate interactivity - minimal to avoid conflicts */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
}

/* Critical input styles - minimal to avoid conflicts */
input {
  box-sizing: border-box;
  display: block;
}

/* Ensure proper flex alignment for HStack components */
.css-1qx5iy2, [data-chakra-component="HStack"] {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Ensure proper flex alignment for VStack components */
.css-1rr4qq7, [data-chakra-component="VStack"] {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Critical layout containers */
.chakra-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 60ch;
  padding-left: 1rem;
  padding-right: 1rem;
}

.chakra-stack {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.chakra-stack > * {
  margin: 0;
  flex-shrink: 0;
}

.chakra-stack > * + * {
  margin-top: 1rem;
}

/* Loading state to prevent flash */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Critical heading styles */
h1, h2, h3 {
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
  margin: 0;
}

h1 {
  font-size: 1.875rem;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.25rem;
}

/* Prevent layout shift for images */
img {
  max-width: 100%;
  height: auto;
}

/* Critical responsive utilities */
@media (max-width: 767px) {
  .chakra-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

/* Additional alignment fixes */
* {
  box-sizing: border-box;
}

/* Ensure flex containers align properly */
[data-chakra-component] {
  display: flex;
}

/* Fix for HStack alignment issues */
.css-70qvj9 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Prevent layout shifts in flex containers */
.chakra-stack > * {
  flex-shrink: 0;
}
`;

// Function to preload critical CSS
export function preloadCriticalCSS() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = CRITICAL_CSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }
}

// Function to load non-critical CSS asynchronously
export function loadNonCriticalCSS() {
  if (typeof document !== 'undefined') {
    // In this implementation, Chakra UI CSS is already bundled
    // This function is kept for future use when we have separate CSS bundles
    console.log('[CSS] Non-critical CSS loading skipped - using bundled styles');
  }
}

// CSS preload hints for important stylesheets
export const CSS_PRELOAD_HINTS = [
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
    as: 'style',
    onload: "this.onload=null;this.rel='stylesheet'"
  }
];

// Function to add CSS preload hints
export function addCSSPreloadHints() {
  if (typeof document !== 'undefined') {
    CSS_PRELOAD_HINTS.forEach(hint => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = hint.href;
      link.as = hint.as;
      if (hint.onload) {
        link.setAttribute('onload', hint.onload);
      }
      document.head.appendChild(link);
    });
  }
}

// Utility to detect if critical CSS is already loaded
export function isCriticalCSSLoaded(): boolean {
  if (typeof document === 'undefined') return false;
  return document.querySelector('style[data-critical="true"]') !== null;
}

// Function to optimize Emotion cache for unused styles
export function optimizeEmotionCache() {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Clean up unused emotion styles
      const emotionStyles = document.querySelectorAll('style[data-emotion]');
      emotionStyles.forEach(style => {
        const sheet = (style as HTMLStyleElement).sheet;
        if (sheet && sheet.cssRules.length === 0) {
          style.remove();
        }
      });
    });
  }
}