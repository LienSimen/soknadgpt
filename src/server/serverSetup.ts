import express from 'express';
import path from 'path';
import { type ServerSetupFn } from 'wasp/server';

const serverSetup: ServerSetupFn = async ({ app }) => {
  const clientBuildPath = path.join(process.cwd(), 'build/client');
  
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
    if (process.env.NODE_ENV === 'production') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Content Security Policy - prevent XSS attacks
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.cartadeapresentacao.pt https://www.google-analytics.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ');
    
    res.set('Content-Security-Policy', cspDirectives);
    
    // X-Content-Type-Options - prevent MIME type sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options - prevent clickjacking
    res.set('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection - enable XSS filtering
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer-Policy - control referrer information
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy - control browser features
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    
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
