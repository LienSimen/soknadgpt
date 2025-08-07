import express from 'express';
import path from 'path';
import compression from 'compression';
import { type ServerSetupFn } from 'wasp/server';

const serverSetup: ServerSetupFn = async ({ app }) => {
  const clientBuildPath = path.join(process.cwd(), 'build/client');
  
  // Add gzip compression middleware (should be one of the first middleware)
  app.use(compression({
    level: 6, // Balance between compression ratio and CPU usage
    threshold: 1024, // Only compress responses that are at least 1KB
    filter: (req, res) => {
      // Don't compress responses with 'x-no-compression' header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Fall back to standard filter function
      return compression.filter(req, res);
    }
  }));
  
  // HTTPS redirect middleware - redirect HTTP to HTTPS in production
  app.use((req, res, next) => {
    // Check if request is not secure and not from localhost/development
    if (!req.secure && 
        req.get('x-forwarded-proto') !== 'https' && 
        process.env.NODE_ENV === 'production' &&
        !req.hostname.includes('localhost') &&
        !req.hostname.includes('127.0.0.1')) {
      
      // Redirect to HTTPS
      const httpsUrl = `https://${req.get('host')}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
    next();
  });

  // Security headers middleware
  app.use((req, res, next) => {
    // HSTS (HTTP Strict Transport Security) - force HTTPS for 1 year
    // Start with shorter max-age for initial deployment, then increase
    if (process.env.NODE_ENV === 'production') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    } else {
      // For development/staging, use shorter duration
      res.set('Strict-Transport-Security', 'max-age=86400; includeSubDomains');
    }
    
    // Content Security Policy - comprehensive XSS protection
    const cspDirectives = [
      "default-src 'self'",
      // Script sources - be restrictive with unsafe-inline/unsafe-eval
      "script-src 'self' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
      // Style sources
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      // Font sources
      "font-src 'self' https://fonts.gstatic.com data:",
      // Image sources - allow data URIs and HTTPS
      "img-src 'self' data: https: blob:",
      // Connection sources for API calls
      "connect-src 'self' https://api.cvcv.no https://api.cartadeapresentacao.pt https://www.google-analytics.com https://www.googletagmanager.com",
      // Frame sources for embedded content
      "frame-src 'self' https://js.stripe.com",
      // Media sources
      "media-src 'self'",
      // Object sources - block all plugins
      "object-src 'none'",
      // Base URI restriction
      "base-uri 'self'",
      // Form action restriction
      "form-action 'self'",
      // Frame ancestors - prevent embedding (clickjacking protection)
      "frame-ancestors 'none'",
      // Worker sources
      "worker-src 'self' blob:",
      // Manifest source
      "manifest-src 'self'",
      // CSP violation reporting
      "report-uri /csp-report",
      // Upgrade insecure requests in production
      ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : [])
    ].join('; ');
    
    // Set CSP header in enforcement mode
    // Add report-uri for CSP violation reporting in production
    res.set('Content-Security-Policy', cspDirectives + '; report-uri /csp-report');
    
    // Cross-Origin-Opener-Policy (COOP) - isolate browsing context
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    
    // Cross-Origin-Embedder-Policy (COEP) - require CORP for cross-origin resources
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Cross-Origin-Resource-Policy (CORP) - control cross-origin resource sharing
    res.set('Cross-Origin-Resource-Policy', 'same-origin');
    
    // X-Content-Type-Options - prevent MIME type sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options - prevent clickjacking (backup to CSP frame-ancestors)
    res.set('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection - enable XSS filtering (legacy browsers)
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer-Policy - control referrer information
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy - control browser features
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()');
    
    // X-Permitted-Cross-Domain-Policies - restrict Adobe Flash/PDF cross-domain access
    res.set('X-Permitted-Cross-Domain-Policies', 'none');
    
    // X-DNS-Prefetch-Control - control DNS prefetching
    res.set('X-DNS-Prefetch-Control', 'off');
    
    next();
  });
  
  // Static file serving with optimized cache headers
  app.use('/assets', express.static(path.join(clientBuildPath, 'assets'), {
    maxAge: '1y',
    etag: true,
    immutable: true,
    setHeaders: (res, path) => {
      // Add security headers for static assets
      res.set('X-Content-Type-Options', 'nosniff');
      
      // Set specific cache headers for different asset types
      if (path.endsWith('.js') || path.endsWith('.css')) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.set('Access-Control-Allow-Origin', '*'); // Allow font loading from CDN
      } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        res.set('Cache-Control', 'public, max-age=2592000'); // 30 days for images
      }
    }
  }));
  
  app.use(express.static(clientBuildPath, {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, path) => {
      // Add security headers for all static files
      res.set('X-Content-Type-Options', 'nosniff');
      
      // Special handling for HTML files
      if (path.endsWith('.html')) {
        res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    }
  }));
  
  // Enhanced cache control middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/assets/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.match(/\.(js|css)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('Access-Control-Allow-Origin', '*');
    } else if (req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      res.set('Cache-Control', 'public, max-age=2592000');
    } else if (req.url === '/' || req.url.endsWith('.html')) {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    next();
  });
};

export default serverSetup;
