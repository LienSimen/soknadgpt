// Image optimization utilities
// Implements lazy loading, alt attribute validation, and image format optimization

import { useEffect, useRef, useState, useCallback } from 'react';

// Image optimization configuration
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Lazy loading threshold (pixels before image enters viewport)
  lazyLoadThreshold: 100,
  
  // Supported modern image formats in order of preference
  supportedFormats: ['webp', 'avif', 'jpg', 'png'],
  
  // Image quality settings
  quality: {
    high: 90,
    medium: 75,
    low: 60
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1440
  }
};

// Alt text validation utility
export function validateAltText(alt: string, src: string): {
  isValid: boolean;
  suggestions: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Check if alt text is missing
  if (!alt || alt.trim() === '') {
    errors.push('Alt text is required for accessibility');
    suggestions.push('Add descriptive alt text that explains what the image shows');
    return { isValid: false, suggestions, errors };
  }
  
  // Check for common bad practices
  if (alt.toLowerCase().includes('image of') || 
      alt.toLowerCase().includes('picture of') ||
      alt.toLowerCase().includes('photo of')) {
    suggestions.push('Remove redundant phrases like "image of" - screen readers already announce it as an image');
  }
  
  // Check for filename in alt text
  const filename = src.split('/').pop()?.split('.')[0];
  if (filename && alt.toLowerCase().includes(filename.toLowerCase())) {
    suggestions.push('Avoid using filename in alt text - describe the content instead');
  }
  
  // Check length
  if (alt.length > 125) {
    suggestions.push('Consider shortening alt text (current: ' + alt.length + ' chars, recommended: <125)');
  }
  
  if (alt.length < 10) {
    suggestions.push('Alt text might be too brief - consider adding more descriptive details');
  }
  
  return {
    isValid: errors.length === 0,
    suggestions,
    errors
  };
}

// Lazy loading hook for images
export function useLazyImage(src: string, alt: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: `${IMAGE_OPTIMIZATION_CONFIG.lazyLoadThreshold}px`,
        threshold: 0.1
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Load image when in view
  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setError('Failed to load image');
      img.src = src;
    }
  }, [isInView, isLoaded, src]);
  
  // Validate alt text
  const altValidation = validateAltText(alt, src);
  
  return {
    imgRef,
    isLoaded,
    isInView,
    error,
    altValidation,
    shouldLoad: isInView
  };
}

// Optimized Image component with lazy loading and alt validation
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: 'high' | 'medium' | 'low';
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  quality = 'medium',
  sizes,
  onLoad,
  onError
}: OptimizedImageProps) {
  const { imgRef, isLoaded, shouldLoad, error, altValidation } = useLazyImage(src, alt);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  // Generate optimized image sources
  useEffect(() => {
    if (shouldLoad || loading === 'eager') {
      // In a real implementation, you might generate different formats/sizes
      // For now, we'll use the original src
      setImageSrc(src);
    }
  }, [shouldLoad, loading, src]);
  
  // Log alt text validation issues in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !altValidation.isValid) {
      console.warn('[Image Accessibility]', altValidation.errors);
      if (altValidation.suggestions.length > 0) {
        console.info('[Image Accessibility] Suggestions:', altValidation.suggestions);
      }
    }
  }, [altValidation]);
  
  // Handle load/error events
  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    const errorMsg = 'Image failed to load';
    onError?.(errorMsg);
  }, [onError]);
  
  // Return props for the img element instead of JSX
  return {
    ref: imgRef,
    src: imageSrc,
    alt,
    width,
    height,
    className: `${className} ${isLoaded ? 'loaded' : 'loading'}`,
    loading,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      opacity: isLoaded ? 1 : 0.7,
      transition: 'opacity 0.3s ease-in-out',
      ...(!isLoaded && { backgroundColor: '#f0f0f0' })
    }
  };
}

// Image format detection utility
export function detectImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
  heic: boolean;
} {
  const support = {
    webp: false,
    avif: false,
    heic: false
  };
  
  // Test WebP support
  const webpCanvas = document.createElement('canvas');
  webpCanvas.width = 1;
  webpCanvas.height = 1;
  support.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  // Test AVIF support (basic check)
  support.avif = 'createImageBitmap' in window;
  
  // Test HEIC support (limited browser support)
  support.heic = false; // Most browsers don't support HEIC yet
  
  return support;
}

// Generate responsive image sources
export function generateResponsiveSources(
  baseSrc: string,
  sizes: { width: number; suffix?: string }[]
): string {
  const srcSet = sizes
    .map(size => {
      const suffix = size.suffix || `_${size.width}w`;
      const responsiveSrc = baseSrc.replace(/(\.[^.]+)$/, `${suffix}$1`);
      return `${responsiveSrc} ${size.width}w`;
    })
    .join(', ');
  
  return srcSet;
}

// Image performance monitoring
export const imagePerformanceMonitor = {
  imagesLoaded: 0,
  imagesFailed: 0,
  totalLoadTime: 0,
  largestImage: 0,
  
  recordImageLoad(loadTime: number, size: number) {
    this.imagesLoaded++;
    this.totalLoadTime += loadTime;
    if (size > this.largestImage) {
      this.largestImage = size;
    }
  },
  
  recordImageError() {
    this.imagesFailed++;
  },
  
  getStats() {
    return {
      imagesLoaded: this.imagesLoaded,
      imagesFailed: this.imagesFailed,
      averageLoadTime: this.imagesLoaded > 0 ? this.totalLoadTime / this.imagesLoaded : 0,
      largestImage: this.largestImage,
      successRate: this.imagesLoaded / (this.imagesLoaded + this.imagesFailed) || 0
    };
  },
  
  reset() {
    this.imagesLoaded = 0;
    this.imagesFailed = 0;
    this.totalLoadTime = 0;
    this.largestImage = 0;
  }
};

// Utility to optimize existing images in public folder
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  // In a real implementation, this would integrate with an image optimization service
  // For now, we'll return the original URL with query parameters for future optimization
  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  const queryString = params.toString();
  return queryString ? `${originalUrl}?${queryString}` : originalUrl;
}

// Alt text suggestions for common image types
export const ALT_TEXT_TEMPLATES = {
  logo: (companyName: string) => `${companyName} logo`,
  profile: (personName: string) => `Profile photo of ${personName}`,
  screenshot: (appName: string, feature: string) => `Screenshot of ${appName} showing ${feature}`,
  chart: (chartType: string, data: string) => `${chartType} chart showing ${data}`,
  icon: (iconPurpose: string) => `${iconPurpose} icon`,
  decorative: () => '', // Empty alt for decorative images
  
  // Template for generating descriptive alt text
  generate: (type: string, context: string, details?: string) => {
    const base = `${type} ${context}`;
    return details ? `${base} - ${details}` : base;
  }
};

// Initialize image optimization
export function initializeImageOptimization() {
  // Detect format support
  const formatSupport = detectImageFormatSupport();
  console.log('[Images] Format support:', formatSupport);
  
  // Set up performance monitoring
  imagePerformanceMonitor.reset();
  
  // Add CSS for image loading states
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .image-loading {
        background-color: #f0f0f0;
        background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
      }
      
      @keyframes loading-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .image-loaded {
        animation: fade-in 0.3s ease-in-out;
      }
      
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('[Images] Image optimization initialized');
}