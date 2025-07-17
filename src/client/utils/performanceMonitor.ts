import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  inp?: number; // Interaction to Next Paint (replaces FID)
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  timestamp: number;
  url: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop';
}

// Use the Metric type from web-vitals directly
export type WebVitalsMetric = Metric;

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    this.initializeMetrics();
    this.setupWebVitalsListeners();
  }

  private initializeMetrics(): void {
    this.metrics = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
    };
  }

  private getDeviceType(): 'mobile' | 'desktop' {
    // Simple device detection based on user agent and screen size
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobile || isSmallScreen ? 'mobile' : 'desktop';
  }

  private setupWebVitalsListeners(): void {
    // Listen for Core Web Vitals metrics
    onFCP((metric) => this.handleMetric('fcp', metric));
    onLCP((metric) => this.handleMetric('lcp', metric));
    onINP((metric) => this.handleMetric('inp', metric));
    onCLS((metric) => this.handleMetric('cls', metric));
    onTTFB((metric) => this.handleMetric('ttfb', metric));
  }

  private handleMetric(metricName: keyof PerformanceMetrics, metric: WebVitalsMetric): void {
    // Update the metrics object in a type-safe way
    if (
      metricName === 'fcp' ||
      metricName === 'lcp' ||
      metricName === 'inp' ||
      metricName === 'cls' ||
      metricName === 'ttfb'
    ) {
      this.metrics[metricName] = metric.value;
    }

    // Log metric for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metricName.toUpperCase()}: ${metric.value}ms (${metric.rating})`);
    }

    // Check if we have all core metrics and notify callbacks
    if (this.hasAllCoreMetrics()) {
      this.notifyCallbacks();
    }
  }

  private hasAllCoreMetrics(): boolean {
    return !!(this.metrics.fcp && this.metrics.lcp && this.metrics.cls && this.metrics.ttfb);
  }

  private notifyCallbacks(): void {
    const completeMetrics = this.metrics as PerformanceMetrics;
    this.callbacks.forEach(callback => {
      try {
        callback(completeMetrics);
      } catch (error) {
        console.error('[Performance Monitor] Callback error:', error);
      }
    });
  }

  // Public methods
  public onMetricsReady(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback);
    
    // If metrics are already ready, call immediately
    if (this.hasAllCoreMetrics()) {
      callback(this.metrics as PerformanceMetrics);
    }
  }

  public getCurrentMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public async getAllMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Return current metrics - web-vitals v5 only provides metrics through callbacks
    return { ...this.metrics };
  }

  public logPerformanceSummary(): void {
    const metrics = this.metrics;
    console.group('[Performance Summary]');
    console.log('URL:', metrics.url);
    console.log('Device Type:', metrics.deviceType);
    console.log('FCP (First Contentful Paint):', metrics.fcp ? `${metrics.fcp}ms` : 'Not available');
    console.log('LCP (Largest Contentful Paint):', metrics.lcp ? `${metrics.lcp}ms` : 'Not available');
    console.log('INP (Interaction to Next Paint):', metrics.inp ? `${metrics.inp}ms` : 'Not available');
    console.log('CLS (Cumulative Layout Shift):', metrics.cls ? metrics.cls.toFixed(3) : 'Not available');
    console.log('TTFB (Time to First Byte):', metrics.ttfb ? `${metrics.ttfb}ms` : 'Not available');
    console.groupEnd();
  }

  // Performance thresholds based on Core Web Vitals
  public getPerformanceRating(): {
    overall: 'good' | 'needs-improvement' | 'poor';
    details: Record<string, 'good' | 'needs-improvement' | 'poor'>;
  } {
    const details: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};

    // FCP thresholds: good < 1800ms, poor > 3000ms
    if (this.metrics.fcp) {
      details.fcp = this.metrics.fcp < 1800 ? 'good' : this.metrics.fcp > 3000 ? 'poor' : 'needs-improvement';
    }

    // LCP thresholds: good < 2500ms, poor > 4000ms
    if (this.metrics.lcp) {
      details.lcp = this.metrics.lcp < 2500 ? 'good' : this.metrics.lcp > 4000 ? 'poor' : 'needs-improvement';
    }

    // INP thresholds: good < 200ms, poor > 500ms
    if (this.metrics.inp) {
      details.inp = this.metrics.inp < 200 ? 'good' : this.metrics.inp > 500 ? 'poor' : 'needs-improvement';
    }

    // CLS thresholds: good < 0.1, poor > 0.25
    if (this.metrics.cls) {
      details.cls = this.metrics.cls < 0.1 ? 'good' : this.metrics.cls > 0.25 ? 'poor' : 'needs-improvement';
    }

    // TTFB thresholds: good < 800ms, poor > 1800ms
    if (this.metrics.ttfb) {
      details.ttfb = this.metrics.ttfb < 800 ? 'good' : this.metrics.ttfb > 1800 ? 'poor' : 'needs-improvement';
    }

    // Calculate overall rating
    const ratings = Object.values(details);
    const poorCount = ratings.filter(r => r === 'poor').length;
    const needsImprovementCount = ratings.filter(r => r === 'needs-improvement').length;

    let overall: 'good' | 'needs-improvement' | 'poor';
    if (poorCount > 0) {
      overall = 'poor';
    } else if (needsImprovementCount > 0) {
      overall = 'needs-improvement';
    } else {
      overall = 'good';
    }

    return { overall, details };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions for direct use
export const trackWebVitals = (callback?: (metrics: PerformanceMetrics) => void) => {
  if (callback) {
    performanceMonitor.onMetricsReady(callback);
  }
  return performanceMonitor;
};

export const getPerformanceMetrics = () => performanceMonitor.getCurrentMetrics();
export const logPerformance = () => performanceMonitor.logPerformanceSummary();