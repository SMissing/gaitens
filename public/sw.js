// Service Worker for Gaitens Leisure Group Staff Portal
const CACHE_NAME = 'gaitens-portal-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
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
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip API routes and external requests
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase.co') ||
    event.request.url.startsWith('chrome-extension://')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      )
    })
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
