// Globalne typy dla Capacitor plugins
export interface CapacitorPlugins {
  PushNotifications?: {
    requestPermissions: () => Promise<{ receive: string }>
    register: () => Promise<void>
    addListener: (event: string, callback: (data: any) => void) => Promise<{ remove: () => void }>
    removeAllListeners: () => Promise<void>
  }
  App?: {
    addListener: (event: string, callback: (data: any) => void) => Promise<{ remove: () => void }>
  }
  Browser?: {
    open: (options: { url: string; windowName?: string }) => Promise<void>
    close: () => Promise<void>
  }
}

export interface CapacitorInstance {
  isNativePlatform?: () => boolean
  Plugins?: CapacitorPlugins
}

declare global {
  interface Window {
    Capacitor?: CapacitorInstance
  }
}
