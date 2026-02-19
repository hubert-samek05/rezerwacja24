'use client'

import { useState, useEffect } from 'react'
import { 
  isIOSNativeApp, 
  isNativeApp, 
  shouldHidePayments, 
  isIOSDevice,
  getPlatformName 
} from '@/lib/platform'

/**
 * Hook to detect platform and determine feature visibility
 * Used for Apple App Store compliance (hiding payments on iOS)
 */
export function usePlatform() {
  const [platform, setPlatform] = useState({
    isIOSNative: false,
    isNative: false,
    hidePayments: false,
    isIOS: false,
    platformName: 'web' as ReturnType<typeof getPlatformName>,
    isReady: false,
  })

  useEffect(() => {
    // Run detection on client side only
    setPlatform({
      isIOSNative: isIOSNativeApp(),
      isNative: isNativeApp(),
      hidePayments: shouldHidePayments(),
      isIOS: isIOSDevice(),
      platformName: getPlatformName(),
      isReady: true,
    })
  }, [])

  return platform
}

/**
 * Hook specifically for hiding payment features on iOS
 */
export function useHidePayments() {
  const { hidePayments, isReady } = usePlatform()
  return { hidePayments, isReady }
}
