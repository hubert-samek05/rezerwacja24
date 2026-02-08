'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const plan = searchParams.get('plan')
    const redirectUrl = plan 
      ? `/login?tab=register&plan=${plan}`
      : '/login?tab=register'
    router.replace(redirectUrl)
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-gray-400">Przekierowywanie...</div>
    </div>
  )
}

export default function RegisterRedirect() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center"><div className="text-gray-400">Ładowanie...</div></div>}>
      <RegisterRedirectContent />
    </Suspense>
  )
}
