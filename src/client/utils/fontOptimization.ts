// Font optimization utilities
// Implements local font fallbacks and font-display optimizations

// Local font fallback stack to reduce layout shift
export const FONT_FALLBACK_STACK = {
  inter: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif'
  ].join(', '),
  
  system: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ].join(', ')
};

// Font loading optimization
export class FontOptimizer {
  private loadedFonts = new Set<string>();
  private fontLoadPromises = new Map<string, Promise<void>>();

  // Preload critical fonts
  async preloadCriticalFonts() {
    const criticalFonts = [
      {
        family: 'Inter',
        weight: '400',
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
      },
      {
        family: 'Inter',
        weight: '600',
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2'
      }
    ];

    const preloadPromises = criticalFonts.map(font => this.preloadFont(font));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('[Fonts] Critical fonts preloaded');
    } catch (error) {
      console.warn('[Fonts] Some critical fonts failed to preload:', error);
    }
  }

  // Preload individual font
  private async preloadFont(font: { family: string; weight: string; url: string }) {
    const fontKey = `${font.family}-${font.weight}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    if (this.fontLoadPromises.has(fontKey)) {
      return this.fontLoadPromises.get(fontKey);
    }

    const promise = this.loadFont(font);
    this.fontLoadPromises.set(fontKey, promise);
    
    try {
      await promise;
      this.loadedFonts.add(fontKey);
    } catch (error) {
      this.fontLoadPromises.delete(fontKey);
      throw error;
    }
  }

  // Load font using Font Loading API
  private async loadFont(font: { family: string; weight: string; url: string }): Promise<void> {
    if (!('FontFace' in window)) {
      // Fallback for browsers without Font Loading API
      return this.loadFontFallback(font);
    }

    try {
      const fontFace = new FontFace(
        font.family,
        `url(${font.url}) format('woff2')`,
        {
          weight: font.weight,
          display: 'swap' // Equivalent to font-display: swap
        }
      );

      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);
      
      console.log(`[Fonts] Loaded ${font.family} ${font.weight}`);
    } catch (error) {
      console.warn(`[Fonts] Failed to load ${font.family} ${font.weight}:`, error);
      throw error;
    }
  }

  // Fallback font loading for older browsers
  private async loadFontFallback(font: { family: string; weight: string; url: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family}:wght@${font.weight}&display=swap`;
      
      link.onload = () => {
        console.log(`[Fonts] Fallback loaded ${font.family} ${font.weight}`);
        resolve();
      };
      
      link.onerror = () => {
        console.warn(`[Fonts] Fallback failed ${font.family} ${font.weight}`);
        reject(new Error(`Failed to load font: ${font.family}`));
      };
      
      document.head.appendChild(link);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error(`Font loading timeout: ${font.family}`));
      }, 10000);
    });
  }

  // Check if font is loaded
  isFontLoaded(family: string, weight: string = '400'): boolean {
    return this.loadedFonts.has(`${family}-${weight}`);
  }

  // Get font loading statistics
  getStats() {
    return {
      loadedFonts: Array.from(this.loadedFonts),
      pendingFonts: Array.from(this.fontLoadPromises.keys()),
      totalLoaded: this.loadedFonts.size,
      totalPending: this.fontLoadPromises.size
    };
  }

  // Clear font loading state
  clear() {
    this.loadedFonts.clear();
    this.fontLoadPromises.clear();
  }
}

// Global font optimizer instance
export const fontOptimizer = new FontOptimizer();

// Font loading performance monitoring
export const fontPerformanceMonitor = {
  fontLoadStartTime: 0,
  fontLoadEndTime: 0,
  fontsLoaded: 0,
  fontsFailed: 0,

  startMonitoring() {
    this.fontLoadStartTime = performance.now();
    
    // Monitor font loading events
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', () => {
        this.fontLoadEndTime = performance.now();
        console.log(`[Fonts] All fonts loaded in ${this.fontLoadEndTime - this.fontLoadStartTime}ms`);
      });

      document.fonts.addEventListener('loadingerror', (event) => {
        this.fontsFailed++;
        console.warn('[Fonts] Font loading error:', event);
      });
    }
  },

  getLoadTime() {
    return this.fontLoadEndTime - this.fontLoadStartTime;
  },

  getStats() {
    return {
      loadTime: this.getLoadTime(),
      fontsLoaded: this.fontsLoaded,
      fontsFailed: this.fontsFailed,
      isLoading: this.fontLoadEndTime === 0
    };
  }
};

// Utility to add font preload hints to document head
export function addFontPreloadHints() {
  if (typeof document === 'undefined') return;

  const fontPreloads = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      type: 'font/woff2'
    },
    {
      href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2',
      type: 'font/woff2'
    }
  ];

  fontPreloads.forEach(font => {
    // Check if preload already exists
    const existingPreload = document.querySelector(`link[href="${font.href}"]`);
    if (existingPreload) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = 'font';
    link.type = font.type;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  });
}

// Initialize font optimization
export async function initializeFontOptimization() {
  try {
    // Start performance monitoring
    fontPerformanceMonitor.startMonitoring();
    
    // Add font preload hints
    addFontPreloadHints();
    
    // Preload critical fonts
    await fontOptimizer.preloadCriticalFonts();
    
    console.log('[Fonts] Font optimization initialized');
  } catch (error) {
    console.warn('[Fonts] Font optimization initialization failed:', error);
  }
}

// Utility to detect if fonts are available
export function detectFontSupport(): { 
  fontLoading: boolean; 
  woff2: boolean; 
  fontDisplay: boolean; 
} {
  const support = {
    fontLoading: 'fonts' in document,
    woff2: false,
    fontDisplay: false
  };

  // Test WOFF2 support
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      support.woff2 = ctx.constructor.toString().indexOf('woff2') !== -1;
    }
  } catch (e) {
    // Fallback detection
    support.woff2 = true; // Assume modern browser
  }

  // Test font-display support
  try {
    const testElement = document.createElement('div');
    (testElement.style as any).fontDisplay = 'swap';
    support.fontDisplay = (testElement.style as any).fontDisplay === 'swap';
  } catch (e) {
    support.fontDisplay = false;
  }

  return support;
}