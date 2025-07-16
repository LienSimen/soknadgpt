import { useEffect, useCallback } from 'react';

// Performance optimization utilities
export const usePerformanceOptimizer = () => {
  // Debounce function to reduce excessive DOM operations
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Throttle function for scroll/resize events
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Batch DOM reads and writes to prevent layout thrashing
  const batchDOMOperations = useCallback((operations: Array<() => void>) => {
    requestAnimationFrame(() => {
      operations.forEach(op => op());
    });
  }, []);

  // Optimize scroll performance
  useEffect(() => {
    const optimizeScrolling = throttle(() => {
      // Passive scroll handling to prevent blocking
    }, 16); // ~60fps

    const handleScroll = (e: Event) => {
      optimizeScrolling();
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [throttle]);

  return {
    debounce,
    throttle,
    batchDOMOperations,
  };
};

// Component to wrap performance-critical sections
export const PerformanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Optimize CSS containment for better performance
    const style = document.createElement('style');
    style.textContent = `
      .perf-container {
        contain: layout style paint;
        will-change: auto;
      }
      .perf-container:hover {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div className="perf-container">{children}</div>;
};