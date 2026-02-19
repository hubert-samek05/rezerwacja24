/**
 * Platform detection utilities
 * Used to detect iOS native app and hide payment-related features
 * Required for Apple App Store compliance (Guideline 3.1.1)
 */

/**
 * Check if running in iOS native app (Capacitor WebView)
 */
export function isIOSNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || ''
  const Capacitor = (window as any).Capacitor
  
  // Check for Capacitor native platform
  const isCapacitorNative = Capacitor?.isNativePlatform?.() === true
  const isIOSPlatform = Capacitor?.getPlatform?.() === 'ios'
  
  // Check for our custom user agent marker
  const hasAppMarker = userAgent.includes('Rezerwacja24App')
  
  // Check for iOS WebView indicators
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isInWebView = (window as any).webkit?.messageHandlers !== undefined
  
  // Return true if:
  // 1. Capacitor native iOS app
  // 2. Or iOS device with our app marker in WebView
  return (isCapacitorNative && isIOSPlatform) || (isIOSDevice && hasAppMarker && isInWebView)
}

/**
 * Check if running in any native mobile app (iOS or Android)
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || ''
  const Capacitor = (window as any).Capacitor
  
  // Check for Capacitor native platform
  const isCapacitorNative = Capacitor?.isNativePlatform?.() === true
  
  // Check for our custom user agent marker
  const hasAppMarker = userAgent.includes('Rezerwacja24App')
  
  return isCapacitorNative || hasAppMarker
}

/**
 * Check if payment/subscription features should be hidden
 * Returns true for iOS native app (Apple App Store requirement)
 */
export function shouldHidePayments(): boolean {
  return isIOSNativeApp()
}

/**
 * Check if running on iOS device (native or web)
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || ''
  return /iPad|iPhone|iPod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Get platform name for analytics/logging
 */
export function getPlatformName(): 'ios-native' | 'android-native' | 'ios-web' | 'android-web' | 'web' {
  if (typeof window === 'undefined') return 'web'
  
  const userAgent = navigator.userAgent || ''
  const Capacitor = (window as any).Capacitor
  
  const isCapacitorNative = Capacitor?.isNativePlatform?.() === true
  const platform = Capacitor?.getPlatform?.()
  
  if (isCapacitorNative) {
    return platform === 'ios' ? 'ios-native' : 'android-native'
  }
  
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios-web'
  if (/Android/.test(userAgent)) return 'android-web'
  
  return 'web'
}
