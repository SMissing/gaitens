'use client'

import { useEffect, useState } from 'react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if browser supports push notifications
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setIsSupported(true)
      checkSubscriptionStatus()
    } else {
      setIsSupported(false)
      setIsLoading(false)
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      await subscribeToPush()
    } else if (permission === 'denied') {
      alert('Notification permission denied. Please enable it in your browser settings.')
    }
  }

  const subscribeToPush = async () => {
    try {
      setIsLoading(true)

      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported')
      }

      const registration = await navigator.serviceWorker.ready

      // Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        // Note: You'll need to generate a VAPID key pair for production
        // For now, we'll use a placeholder
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

        if (!vapidPublicKey) {
          console.warn('VAPID public key not configured. Push notifications will not work.')
          setIsLoading(false)
          return
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
      }

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to register subscription')
      }

      setIsSubscribed(true)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      alert('Failed to enable push notifications. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      setIsLoading(true)

      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remove subscription from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        })

        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      alert('Failed to disable push notifications. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Convert VAPID key from base64 URL to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Don't render anything - this component just manages subscriptions
  // You can add a UI button if needed
  return null
}
