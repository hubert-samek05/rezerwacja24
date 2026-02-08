// System powiadomień - połączony z API

import { getCurrentUserId, getTenantId } from './storage'

export interface Notification {
  id: string
  type: 'booking' | 'reminder' | 'customer' | 'payment' | 'alert' | 'success' | 'info'
  title: string
  message: string
  createdAt: string
  read: boolean
  actionUrl?: string
  metadata?: any
}

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
  }
  return 'https://api.rezerwacja24.pl'
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return []

    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch notifications')
      return []
    }

    const notifications = await response.json()
    return notifications.map((n: any) => ({
      ...n,
      type: n.type.toLowerCase(),
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return

    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export const markAllAsRead = async (): Promise<void> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return

    await fetch(`${API_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return

    await fetch(`${API_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

export const clearAllNotifications = async (): Promise<void> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return

    await fetch(`${API_URL}/api/notifications`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })
  } catch (error) {
    console.error('Error clearing notifications:', error)
  }
}

export const getUnreadCount = async (): Promise<number> => {
  try {
    const API_URL = getApiUrl()
    const tenantId = getTenantId()
    const userId = getCurrentUserId()
    
    if (!tenantId || !userId) return 0

    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId,
      },
    })

    if (!response.ok) return 0

    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}
