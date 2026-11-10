// ExpenseFlow Service Worker - Offline Shell & Asset Caching
const CACHE_NAME = 'expenseflow-v1.0.1';

// Core assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Helper: fetch with timeout for poor connections
function fetchWithTimeout(request, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Fetch timed out'));
    }, timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Install Event: pre-cache application shell with error tolerance
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('ExpenseFlow SW precache warning for', asset, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up outdated caches without affecting LocalStorage
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: handle offline serving and caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Only handle HTTP/HTTPS protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never cache Vite development server internal paths or HMR
  if (url.pathname.startsWith('/@') || url.pathname.includes('/node_modules/')) {
    return;
  }

  // Only cache same origin assets or authorized CDNs (e.g. Google Fonts)
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) {
    return;
  }

  // 1. Navigation requests (HTML pages for SPA routes e.g. /transactions, /budgets)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(request, 3500)
        .then((networkResponse) => {
          // If network succeeds, cache a copy of the fresh HTML
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline or timeout, serve the cached navigation response or fallback to /index.html
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html').then((indexResponse) => {
              if (indexResponse) return indexResponse;
              return caches.match('/');
            });
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts) - Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Only cache valid responses
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      // Return cached version immediately if available, while fetching update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for message from app (e.g. SKIP_WAITING)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
