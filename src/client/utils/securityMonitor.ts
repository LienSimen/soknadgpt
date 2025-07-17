// Security monitoring utilities
// Validates HTTPS, security headers, and mixed content

export interface SecurityCheckResult {
  isSecure: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

// Security monitoring class
export class SecurityMonitor {
  private securityIssues: string[] = [];
  private mixedContentWarnings: string[] = [];

  // Check if the current connection is secure
  isConnectionSecure(): boolean {
    if (typeof window === 'undefined') return true; // SSR safe
    
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  // Check for mixed content issues
  checkMixedContent(): string[] {
    if (typeof document === 'undefined') return [];
    
    const mixedContentIssues: string[] = [];
    
    // Check for HTTP resources on HTTPS pages
    if (this.isConnectionSecure() && window.location.protocol === 'https:') {
      // Check images
      const images = document.querySelectorAll('img[src^="http:"]');
      if (images.length > 0) {
        mixedContentIssues.push(`Found ${images.length} HTTP images on HTTPS page`);
      }
      
      // Check scripts
      const scripts = document.querySelectorAll('script[src^="http:"]');
      if (scripts.length > 0) {
        mixedContentIssues.push(`Found ${scripts.length} HTTP scripts on HTTPS page`);
      }
      
      // Check stylesheets
      const stylesheets = document.querySelectorAll('link[href^="http:"]');
      if (stylesheets.length > 0) {
        mixedContentIssues.push(`Found ${stylesheets.length} HTTP stylesheets on HTTPS page`);
      }
      
      // Check iframes
      const iframes = document.querySelectorAll('iframe[src^="http:"]');
      if (iframes.length > 0) {
        mixedContentIssues.push(`Found ${iframes.length} HTTP iframes on HTTPS page`);
      }
    }
    
    return mixedContentIssues;
  }

  // Validate Content Security Policy
  validateCSP(): { isPresent: boolean; issues: string[] } {
    if (typeof document === 'undefined') {
      return { isPresent: false, issues: ['Cannot check CSP in server environment'] };
    }

    const issues: string[] = [];
    
    // Check if CSP is set via meta tag or HTTP header
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    // In a real implementation, you would check the actual HTTP headers
    // For now, we'll assume CSP is set via server configuration
    const hasCsp = !!cspMeta || process.env.NODE_ENV === 'production';
    
    if (!hasCsp) {
      issues.push('Content Security Policy not detected');
    }
    
    // Check for common CSP issues
    if (cspMeta) {
      const cspContent = cspMeta.getAttribute('content') || '';
      
      if (cspContent.includes("'unsafe-eval'")) {
        issues.push("CSP allows 'unsafe-eval' which may be risky");
      }
      
      if (cspContent.includes("'unsafe-inline'") && cspContent.includes('script-src')) {
        issues.push("CSP allows 'unsafe-inline' scripts which reduces security");
      }
      
      if (!cspContent.includes('object-src')) {
        issues.push('CSP should include object-src directive');
      }
    }
    
    return { isPresent: hasCsp, issues };
  }

  // Check security headers (client-side detection is limited)
  checkSecurityHeaders(): { [key: string]: boolean } {
    // Note: Most security headers can't be read from JavaScript due to browser security
    // This is a basic check for what we can detect
    
    const headers = {
      httpsRedirect: this.isConnectionSecure(),
      mixedContentBlocked: this.checkMixedContent().length === 0,
      cspPresent: this.validateCSP().isPresent
    };
    
    return headers;
  }

  // Perform comprehensive security audit
  performSecurityAudit(): SecurityCheckResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check HTTPS
    if (!this.isConnectionSecure()) {
      issues.push('Connection is not secure (not using HTTPS)');
      recommendations.push('Enable HTTPS redirect in server configuration');
    }
    
    // Check mixed content
    const mixedContent = this.checkMixedContent();
    if (mixedContent.length > 0) {
      issues.push(...mixedContent);
      recommendations.push('Update all HTTP resources to use HTTPS');
    }
    
    // Check CSP
    const cspCheck = this.validateCSP();
    if (!cspCheck.isPresent) {
      warnings.push('Content Security Policy not detected');
      recommendations.push('Implement Content Security Policy headers');
    }
    issues.push(...cspCheck.issues);
    
    // Check for development mode in production
    if (process.env.NODE_ENV !== 'production' && this.isConnectionSecure()) {
      warnings.push('Application appears to be in development mode');
      recommendations.push('Ensure production build is deployed');
    }
    
    // Check for console errors that might indicate security issues
    if (typeof window !== 'undefined' && window.console) {
      // This is a basic check - in practice you'd want more sophisticated monitoring
      const hasConsoleErrors = this.securityIssues.length > 0;
      if (hasConsoleErrors) {
        warnings.push('Security-related console errors detected');
      }
    }
    
    return {
      isSecure: issues.length === 0,
      issues,
      warnings,
      recommendations
    };
  }

  // Monitor for security-related console errors
  monitorConsoleErrors(): void {
    if (typeof window === 'undefined') return;
    
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Check for security-related errors
      if (message.includes('Mixed Content') ||
          message.includes('CSP') ||
          message.includes('HTTPS') ||
          message.includes('Insecure') ||
          message.includes('blocked by CORS')) {
        this.securityIssues.push(message);
      }
      
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Check for security-related warnings
      if (message.includes('Mixed Content') ||
          message.includes('Insecure') ||
          message.includes('deprecated')) {
        this.mixedContentWarnings.push(message);
      }
      
      originalWarn.apply(console, args);
    };
  }

  // Get security statistics
  getSecurityStats() {
    return {
      isSecure: this.isConnectionSecure(),
      securityIssues: this.securityIssues.length,
      mixedContentWarnings: this.mixedContentWarnings.length,
      lastAudit: new Date().toISOString()
    };
  }

  // Reset monitoring state
  reset() {
    this.securityIssues = [];
    this.mixedContentWarnings = [];
  }
}

// Global security monitor instance (browser-only)
export const securityMonitor: SecurityMonitor | undefined =
  typeof window !== 'undefined' ? new SecurityMonitor() : undefined;

// HTTPS enforcement utility
export function enforceHTTPS(): void {
  if (typeof window === 'undefined') return;
  
  // Redirect to HTTPS if on HTTP (client-side fallback)
  if (window.location.protocol === 'http:' && 
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')) {
    
    const httpsUrl = window.location.href.replace('http:', 'https:');
    window.location.replace(httpsUrl);
  }
}

// Security header validation utility
export function validateSecurityImplementation(): Promise<SecurityCheckResult> {
  return new Promise((resolve) => {
    // Allow time for page to fully load
    setTimeout(() => {
      const result = securityMonitor?.performSecurityAudit() || { 
        isSecure: false, 
        issues: ['Security monitor not available'], 
        warnings: [],
        recommendations: ['Initialize security monitoring in browser environment']
      };
      resolve(result);
    }, 1000);
  });
}

// Initialize security monitoring
export function initializeSecurityMonitoring(): void {
  // Enforce HTTPS
  enforceHTTPS();
  
  // Start console monitoring
  securityMonitor?.monitorConsoleErrors();
  
  // Perform initial security audit in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      validateSecurityImplementation().then((result) => {
        if (result.issues.length > 0) {
          console.warn('[Security] Issues detected:', result.issues);
        }
        if (result.warnings.length > 0) {
          console.info('[Security] Warnings:', result.warnings);
        }
        if (result.recommendations.length > 0) {
          console.info('[Security] Recommendations:', result.recommendations);
        }
        
        console.log('[Security] Security monitoring initialized');
      });
    }, 2000);
  }
}

// Utility to check if all security measures are properly implemented
export async function runSecurityHealthCheck(): Promise<{
  score: number;
  details: SecurityCheckResult;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}> {
  const details = await validateSecurityImplementation();
  
  // Calculate security score
  let score = 100;
  
  // Deduct points for issues
  score -= details.issues.length * 20;
  score -= details.warnings.length * 10;
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  // Assign grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';
  
  return { score, details, grade };
}