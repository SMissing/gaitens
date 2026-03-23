// Service Worker for Gaitens Leisure Group Staff Portal
const CACHE_NAME = 'gaitens-portal-v1'
const urlsToCache = [
  '/manifest.json',
  '/logos/gaitens-text-logo.png',
]

// #region agent log (debug instrumentation helpers)
const DEBUG_ENDPOINT = 'http://127.0.0.1:7877/ingest/9d5d80a7-cef2-45ef-b10c-77db6895456c'
const DEBUG_SESSION_ID = '3ce7f9'
const DEBUG_RUN_ID = 'post-fix'
const debugPost = (payload) =>
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': DEBUG_SESSION_ID },
    body: JSON.stringify(payload),
  }).catch(() => {})
// #endregion agent log

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  event.waitUntil(
    (async () => {
      // Purge cached navigation responses that may reference stale chunk filenames.
      const cache = await caches.open(CACHE_NAME)
      const keys = await cache.keys()
      let deleted = 0
      await Promise.all(
        keys.map(async (req) => {
          const url = req && req.url ? req.url : ''
          if (url.includes('/login') || url.includes('/dashboard') || url.endsWith('://localhost:3000/') || url.endsWith('://localhost:3000/dashboard') || url.endsWith('://localhost:3000/login')) {
            const didDelete = await cache.delete(req)
            if (didDelete) deleted += 1
          }
        })
      )

      debugPost({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'H1',
        location: 'public/sw.js:activate',
        message: 'Purged cached /login entries on SW activate',
        data: { cacheName: CACHE_NAME, deletedLoginEntries: deleted },
        timestamp: Date.now(),
      })
    })()
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Never cache/intercept the service worker script itself.
  if (event.request.url.includes('/sw.js')) {
    return
  }

  // Never intercept our own debug ingest calls (avoids feedback loops).
  if (event.request.url.includes('127.0.0.1:7877/ingest/')) {
    return
  }

  // Never cache navigation/HTML responses. In dev, stale cached HTML can reference old chunk filenames and cause ChunkLoadError/404s.
  const accept = event.request.headers && event.request.headers.get
    ? (event.request.headers.get('accept') || '')
    : ''
  const isNavigation =
    event.request.mode === 'navigate' || accept.includes('text/html')
  if (isNavigation) {
    return event.respondWith(fetch(event.request))
  }

  // #region agent log (prove SW fetch handler sees /login-related requests)
  // Note: we log only, not cache, for any request that targets /login.
  let pathname = null
  try {
    pathname = new URL(event.request.url).pathname
  } catch (e) {}
  const isLoginRequest =
    pathname === '/login' || pathname === '/login/' || (pathname && pathname.startsWith('/login'))

  if (isLoginRequest) {
    debugPost({
      sessionId: DEBUG_SESSION_ID,
      runId: DEBUG_RUN_ID,
      hypothesisId: 'H1',
      location: 'public/sw.js:fetch(loginBypass)',
      message: 'SW bypasses cache for /login request',
      data: { cacheName: CACHE_NAME, url: event.request.url, pathname },
      timestamp: Date.now(),
    })
    // Always serve /login from network to avoid stale cached HTML/RSC references.
    event.respondWith(fetch(event.request))
    return
  }
  // #endregion agent log

  // Skip API routes and external requests
  if (
    // Never cache/intercept Next.js assets/HMR artifacts.
    // Service worker caching stale `/_next/static/*` or `hot-update.json` can
    // lead to ChunkLoadError (404 for the client chunk) and hydration failures.
    event.request.url.includes('/_next/') ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase.co') ||
    event.request.url.startsWith('chrome-extension://')
  ) {
    // #region agent log (confirm we skip the failing login chunk asset)
    if (event.request.url.includes('/_next/static/chunks/app/login/page.js')) {
      debugPost({
        sessionId: DEBUG_SESSION_ID,
        runId: DEBUG_RUN_ID,
        hypothesisId: 'H3',
        location: 'public/sw.js:fetch(skipNextAsset)',
        message: 'SW skipping Next asset request',
        data: {
          cacheName: CACHE_NAME,
          url: event.request.url,
        },
        timestamp: Date.now(),
      })
    }
    // #endregion agent log
    return
  }

  event.respondWith(
    (async () => {
      // Default: cache-first (for non-Next assets, non-api, etc.)
      const response = await caches.match(event.request)
      if (response) return response

      const networkResponse = await fetch(event.request)

      // Don't cache if not a valid response
      if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
        return networkResponse
      }

      const responseToCache = networkResponse.clone()
      const cache = await caches.open(CACHE_NAME)
      await cache.put(event.request, responseToCache)
      return networkResponse
    })()
  )
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Achievement Unlocked!',
    body: 'You\'ve been awarded a new achievement!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'achievement',
    requireInteraction: false,
    data: {
      url: '/achievements'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data
      }
    } catch (e) {
      console.error('Error parsing push notification data:', e)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View Achievement'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  )
})

// Notification click event - handle when user clicks notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/achievements'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
