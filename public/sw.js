// Service Worker for Gaitens Leisure Group Staff Portal
const CACHE_NAME = 'gaitens-portal-v1'
const urlsToCache = [
  '/manifest.json',
  '/logos/gaitens-text-logo.png',
]

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
      await Promise.all(
        keys.map(async (req) => {
          const url = req && req.url ? req.url : ''
          if (url.includes('/login') || url.includes('/dashboard') || url.endsWith('://localhost:3000/') || url.endsWith('://localhost:3000/dashboard') || url.endsWith('://localhost:3000/login')) {
            await cache.delete(req)
          }
        })
      )
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

  // Never cache navigation/HTML responses. In dev, stale cached HTML can reference old chunk filenames and cause ChunkLoadError/404s.
  const accept = event.request.headers && event.request.headers.get
    ? (event.request.headers.get('accept') || '')
    : ''
  const isNavigation =
    event.request.mode === 'navigate' || accept.includes('text/html')
  if (isNavigation) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Always serve /login from network — never from cache — to avoid stale HTML/RSC references.
  let pathname = null
  try {
    pathname = new URL(event.request.url).pathname
  } catch (e) {}
  if (pathname && pathname.startsWith('/login')) {
    event.respondWith(fetch(event.request))
    return
  }

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
    return
  }

  event.respondWith(
    (async () => {
      // Default: cache-first (for non-Next assets, non-api, etc.)
      const response = await caches.match(event.request)
      if (response) return response

      let networkResponse
      try {
        networkResponse = await fetch(event.request)
      } catch (err) {
        // Offline, aborted navigation, etc. — nothing cached either, so surface a clean failure
        // instead of an unhandled rejection.
        return new Response(null, { status: 504, statusText: 'Network error' })
      }

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
