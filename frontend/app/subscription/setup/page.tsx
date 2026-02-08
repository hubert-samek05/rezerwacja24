'use client'

import { useEffect } from 'react'

export default function SubscriptionSetupPage() {
  useEffect(() => {
    // Natychmiast przekieruj do dashboard
    window.location.href = '/dashboard'
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Przekierowywanie...</p>
    </div>
  )
}
