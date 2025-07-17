// Service Worker for Cover Letter GPT
// Implements cache-first strategy for static assets and network-first for API calls

const CACHE_NAME = 'coverletter-gpt-v1';
const STATIC_CACHE_NAME = 'coverletter-static-v1';
const API_CACHE_NAME = 'coverletter-api-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/robots.txt',
  // Add other critical static assets
];

// Cache strategies
const CACHE_FIRST_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.webp$/,
];

// Google Fonts specific patterns for aggressive caching
const FONT_CACHE_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /cartadeapresentacao\.pt\/api/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Aggressive caching for Google Fonts (49 KiB payload optimization)
    if (FONT_CACHE_PATTERNS.some(pattern => pattern.test(url.hostname))) {
      return await fontCacheFirstStrategy(request);
    }
    
    // Network-first strategy for API calls
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirstStrategy(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirstStrategy(request);
    }
    
    // Default: network-first for HTML pages
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    
    // Try to serve from cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Serve from cache
    return cachedResponse;
  }
  
  // Fetch from network and cache
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    // Clone response before caching (response can only be consumed once)
    const responseClone = networkResponse.clone();
    await cache.put(request, responseClone);
  }
  
  return networkResponse;
}

async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses (except for auth endpoints)
      const url = new URL(request.url);
      if (!url.pathname.includes('/auth') && !url.pathname.includes('/login')) {
        const responseClone = networkResponse.clone();
        await cache.put(request, responseClone);
      }
    }
    
    return networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

async function fontCacheFirstStrategy(request) {
  const FONT_CACHE_NAME = 'coverletter-fonts-v1';
  const cache = await caches.open(FONT_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Serve from cache immediately for fonts
    console.log('[SW] Serving font from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    // Fetch from network with longer timeout for fonts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      // Cache fonts aggressively with long expiration
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      console.log('[SW] Cached font:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('[SW] Font loading failed, checking cache again:', error.message);
    
    // Final fallback to cache
    const fallbackResponse = await cache.match(request);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    // If no cached font available, return a proper error response
    return new Response('Font not available', {
      status: 404,
      statusText: 'Font Not Found',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Implement background sync logic for offline actions
  // This could include syncing form submissions, analytics, etc.
  console.log('[SW] Performing background sync');
}

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification received:', data);
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    console.log('[SW] Performance metrics received:', event.data.metrics);
    // Could store or forward performance metrics
  }
});