
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { user } = useAuth()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return 'denied'
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
    }
  }

  const subscribeToNotifications = async () => {
    if (!user) return

    // Subscribe to order notifications
    const orderChannel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            showNotification('Order Update', {
              body: `Your order status has been updated to: ${payload.new.status}`,
              tag: 'order-update'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            showNotification(payload.new.title, {
              body: payload.new.message,
              tag: 'general-notification'
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
    }
  }

  return {
    permission,
    requestPermission,
    showNotification,
    subscribeToNotifications
  }
}
