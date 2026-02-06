// =============================================================================
// ABHISHEK PANDA COMMAND CENTER - SERVICE WORKER
// CIA-Level Security with Offline Support
// =============================================================================

const CACHE_NAME = 'ap-admin-v2';
const STATIC_CACHE = 'ap-static-v2';
const DYNAMIC_CACHE = 'ap-dynamic-v2';
const API_CACHE = 'ap-api-v2';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/admin/login',
  '/admin/security',
  '/index.html',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/robots.txt',
];

// API endpoints to cache for offline
const CACHEABLE_API_PATTERNS = [
  /\/rest\/v1\/profiles/,
  /\/rest\/v1\/user_roles/,
  /\/rest\/v1\/dashboard_widgets/,
  /\/rest\/v1\/notification_settings/,
  /\/rest\/v1\/blog_posts/,
  /\/rest\/v1\/courses/,
  /\/rest\/v1\/products/,
  /\/rest\/v1\/llm_models/,
];

// =============================================================================
// INSTALL EVENT - Pre-cache static assets
// =============================================================================
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing with offline support...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service Worker: Cache install failed', error);
      })
  );
});

// =============================================================================
// ACTIVATE EVENT - Clean up old caches
// =============================================================================
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== CACHE_NAME && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('Service Worker: Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => clients.claim())
  );
});

// =============================================================================
// FETCH EVENT - Serve from cache, fallback to network
// =============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests with Network First strategy
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with Cache First strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with Network First + Offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default: Stale While Revalidate for other requests
  event.respondWith(staleWhileRevalidate(request));
});

// =============================================================================
// CACHING STRATEGIES
// =============================================================================

// Network First - Try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && isCacheableApi(request.url)) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving API from cache (offline)');
      return cachedResponse;
    }
    
    // Return offline JSON response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'You are currently offline. Data will sync when connection is restored.',
        offline: true 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Cache First - Try cache, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for static asset');
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - Serve from cache, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || networkPromise;
}

// Navigation Strategy - For page navigations
async function navigationStrategy(request) {
  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for offline use
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try to serve the cached index.html for SPA routing
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Return offline page
    return new Response(getOfflinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isApiRequest(url) {
  return url.pathname.includes('/rest/v1/') || 
         url.pathname.includes('/functions/v1/') ||
         url.hostname.includes('supabase');
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

function isCacheableApi(urlString) {
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(urlString));
}

function getOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - AP Command Center</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e2e8f0;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 400px;
        }
        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .icon svg {
          width: 40px;
          height: 40px;
          fill: white;
        }
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        button {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        .status {
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #f87171;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" 
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h1>You're Offline</h1>
        <p>The Command Center requires an internet connection for security verification. Please check your connection and try again.</p>
        <button onclick="window.location.reload()">Try Again</button>
        <div class="status">
          <strong>Security Notice:</strong> Offline mode has limited functionality to maintain CIA-level security standards.
        </div>
      </div>
      <script>
        window.addEventListener('online', () => window.location.reload());
      </script>
    </body>
    </html>
  `;
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {
    title: 'Security Alert',
    body: 'New activity detected in Admin Command Center',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'security-alert',
    requireInteraction: true,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes('/admin') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/admin/security');
          }
        })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed');
});

// =============================================================================
// BACKGROUND SYNC - Queue actions when offline
// =============================================================================
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'security-alert-sync') {
    event.waitUntil(syncSecurityAlerts());
  }
  
  if (event.tag === 'pending-actions-sync') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncSecurityAlerts() {
  console.log('Syncing security alerts...');
  // Sync any pending security alerts when back online
}

async function syncPendingActions() {
  console.log('Syncing pending actions...');
  // Process queued actions when connection is restored
  try {
    const cache = await caches.open('ap-pending-actions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// =============================================================================
// MESSAGE HANDLER - Communication with main thread
// =============================================================================
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      })
    );
  }
});

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  
  return status;
}

console.log('Service Worker: Loaded with CIA-level offline support');
