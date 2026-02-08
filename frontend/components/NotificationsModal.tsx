'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Trash2, Calendar, Clock, User, DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllAsRead, deleteNotification, type Notification } from '@/lib/notifications'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    const allNotifications = await getNotifications()
    setNotifications(allNotifications)
  }

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    loadNotifications()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    loadNotifications()
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5" />
      case 'reminder':
        return <Clock className="w-5 h-5" />
      case 'customer':
        return <User className="w-5 h-5" />
      case 'payment':
        return <DollarSign className="w-5 h-5" />
      case 'alert':
        return <AlertCircle className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-500/20 text-blue-400'
      case 'reminder':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'customer':
        return 'bg-purple-500/20 text-purple-400'
      case 'payment':
        return 'bg-green-500/20 text-green-400'
      case 'alert':
        return 'bg-red-500/20 text-red-400'
      case 'success':
        return 'bg-accent-neon/20 text-accent-neon'
      default:
        return 'bg-neutral-gray/20 text-neutral-gray'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Teraz'
    if (minutes < 60) return `${minutes} min temu`
    if (hours < 24) return `${hours} godz. temu`
    if (days < 7) return `${days} dni temu`
    return date.toLocaleDateString('pl-PL')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] glass-card border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Powiadomienia</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-neutral-gray mt-1">
                      {unreadCount} nieprzeczytanych
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-gray" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-green text-[var(--text-primary)]'
                      : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  Wszystkie
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-green text-[var(--text-primary)]'
                      : 'text-neutral-gray hover:bg-white/5'
                  }`}
                >
                  Nieprzeczytane
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="ml-auto text-sm text-accent-neon hover:underline"
                  >
                    Oznacz wszystkie
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-neutral-gray/50" />
                  </div>
                  <p className="text-neutral-gray">
                    {filter === 'unread' ? 'Brak nieprzeczytanych powiadomień' : 'Brak powiadomień'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read
                        ? 'bg-white/5 border-white/10'
                        : 'bg-primary-green/10 border-primary-green/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--text-primary)] font-medium mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-neutral-gray mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-gray/70">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 hover:bg-white/5 rounded transition-colors"
                            title="Oznacz jako przeczytane"
                          >
                            <Check className="w-4 h-4 text-accent-neon" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
