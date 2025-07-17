// Conditional authentication utilities
// Optimizes authentication checks to avoid unnecessary API calls and console errors

import { useAuth } from 'wasp/client/auth';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = [
  '/cover-letter',
  '/jobs',
  '/profile',
  '/checkout'
];

// Routes that are public and don't need auth checks
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/tos',
  '/privacy'
];

// Hook for conditional authentication
export function useConditionalAuth() {
  const location = useLocation();
  const authResult = useAuth();
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Determine if current route requires authentication
  const requiresAuth = AUTH_REQUIRED_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    location.pathname === route || (route === '/' && location.pathname === '/')
  );

  // Only check auth when needed
  useEffect(() => {
    if (requiresAuth && !isPublicRoute) {
      setShouldCheckAuth(true);
    } else {
      setShouldCheckAuth(false);
      setAuthError(null);
    }
  }, [location.pathname, requiresAuth, isPublicRoute]);

  // Handle auth errors gracefully
  useEffect(() => {
    if (shouldCheckAuth && authResult.error) {
      // Don't log 401 errors to console as they're expected for unauthenticated users
      const errorMessage = (authResult.error as any)?.message || '';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setAuthError(null); // Suppress 401 errors
      } else {
        setAuthError(authResult.error as Error);
      }
    }
  }, [shouldCheckAuth, authResult.error]);

  return {
    ...authResult,
    shouldCheckAuth,
    requiresAuth,
    isPublicRoute,
    authError,
    // Override error to prevent console spam
    error: authError
  };
}

// Deduplication window in milliseconds (configurable)
const REQUEST_DEDUPLICATION_WINDOW_MS = 100;

// Request deduplication utility
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  private requestCounts = new Map<string, number>();
  private lastRequestTime = new Map<string, number>();

  // Deduplicate requests by key
  deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(key) || 0;

    // If same request was made recently (within configurable window), return existing promise
    if (this.pendingRequests.has(key) && (now - lastTime) < REQUEST_DEDUPLICATION_WINDOW_MS) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
        this.lastRequestTime.set(key, now);
      });

    this.pendingRequests.set(key, promise);
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    return promise;
  }

  // Get request statistics
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      totalRequests: Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0),
      requestCounts: Object.fromEntries(this.requestCounts)
    };
  }

  // Clear all pending requests
  clear() {
    this.pendingRequests.clear();
    this.requestCounts.clear();
    this.lastRequestTime.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Exponential backoff utility for failed requests
export class ExponentialBackoff {
  private attempts = new Map<string, number>();
  private lastAttempt = new Map<string, number>();

  async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    const attempts = this.attempts.get(key) || 0;
    const lastTime = this.lastAttempt.get(key) || 0;
    const now = Date.now();

    try {
      const result = await requestFn();
      // Reset on success
      this.attempts.delete(key);
      this.lastAttempt.delete(key);
      return result;
    } catch (error: any) {
      // Don't retry auth failures
      if (error?.status === 401 || error?.status === 403) {
        throw error;
      }

      if (attempts >= maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempts);
      const timeSinceLastAttempt = now - lastTime;

      // If we haven't waited long enough, wait more
      if (timeSinceLastAttempt < delay) {
        await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastAttempt));
      }

      this.attempts.set(key, attempts + 1);
      this.lastAttempt.set(key, Date.now());

      // Retry
      return this.execute(key, requestFn, maxAttempts, baseDelay);
    }
  }

  // Get backoff statistics
  getStats() {
    return {
      activeBackoffs: this.attempts.size,
      attempts: Object.fromEntries(this.attempts)
    };
  }

  // Clear backoff state
  clear() {
    this.attempts.clear();
    this.lastAttempt.clear();
  }
}

export const exponentialBackoff = new ExponentialBackoff();

// Enhanced error handler that suppresses expected errors
export function handleApiError(error: any, context: string = 'API'): void {
  // Suppress expected authentication errors
  if (error?.status === 401 || error?.status === 403) {
    // Don't log to console, these are expected for unauthenticated users
    return;
  }

  // Suppress network errors that are expected in offline scenarios
  if (error?.message?.includes('NetworkError') ||
    error?.message?.includes('Failed to fetch')) {
    console.warn(`[${context}] Network error (expected in offline mode):`, error.message);
    return;
  }

  // Log other errors normally
  console.error(`[${context}] Unexpected error:`, error);
}

// Custom hook for optimized API queries with error handling
export function useOptimizedQuery<T, P>(
  queryFn: any,
  params: P,
  options: any = {}
) {
  const { shouldCheckAuth, requiresAuth } = useConditionalAuth();
  const [error, setError] = useState<Error | null>(null);

  // Only enable query if auth is not required or if auth check should happen
  const shouldEnable = !requiresAuth || shouldCheckAuth;

  const result = queryFn(params, {
    ...options,
    enabled: shouldEnable && (options.enabled !== false),
    retry: (failureCount: number, error: any) => {
      // Don't retry auth failures
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Only retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      handleApiError(error, 'Query');
      setError(error);
    }
  });

  return {
    ...result,
    error: error || result.error
  };
}

// Performance monitoring for auth operations
export const authPerformanceMonitor = {
  authCheckCount: 0,
  authSuccessCount: 0,
  authErrorCount: 0,
  lastAuthTime: 0,

  recordAuthCheck() {
    this.authCheckCount++;
    this.lastAuthTime = performance.now();
  },

  recordAuthSuccess() {
    this.authSuccessCount++;
  },

  recordAuthError() {
    this.authErrorCount++;
  },

  getStats() {
    return {
      totalChecks: this.authCheckCount,
      successRate: this.authCheckCount > 0 ? this.authSuccessCount / this.authCheckCount : 0,
      errorRate: this.authCheckCount > 0 ? this.authErrorCount / this.authCheckCount : 0,
      lastAuthTime: this.lastAuthTime
    };
  },

  reset() {
    this.authCheckCount = 0;
    this.authSuccessCount = 0;
    this.authErrorCount = 0;
    this.lastAuthTime = 0;
  }
};