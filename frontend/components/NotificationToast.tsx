'use client'

import { useEffect, useState } from 'react'
import { X, Bell, Calendar, CreditCard, User, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Notification } from '@/lib/notifications'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
}

export default function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animacja wejścia
    setTimeout(() => setIsVisible(true), 50)
    
    // Auto-zamknięcie po 5 sekundach
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'booking': return <Calendar className="w-5 h-5" />
      case 'payment': return <CreditCard className="w-5 h-5" />
      case 'customer': return <User className="w-5 h-5" />
      case 'alert': return <AlertCircle className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getIconColor = () => {
    switch (notification.type) {
      case 'booking': return 'text-blue-500'
      case 'payment': return 'text-green-500'
      case 'customer': return 'text-purple-500'
      case 'alert': return 'text-red-500'
      case 'success': return 'text-green-500'
      default: return 'text-[var(--text-muted)]'
    }
  }

  return (
    <div 
      className={`fixed top-20 right-4 z-[100] max-w-sm w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{notification.message}</p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 p-1 hover:bg-[var(--bg-card-hover)] rounded transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  )
}
