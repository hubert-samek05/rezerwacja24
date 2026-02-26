import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.rezerwacja24.app',
  appName: 'Rezerwacja24',
  webDir: 'out',
  server: {
    // Aplikacja łączy się z produkcyjnym API
    url: 'https://app.rezerwacja24.pl',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Zachowaj dane localStorage między sesjami
    appendUserAgent: 'Rezerwacja24App'
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    appendUserAgent: 'Rezerwacja24App'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#FFFFFF'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    CapacitorCookies: {
      enabled: true
    },
    CapacitorHttp: {
      enabled: true
    },
    // Sign in with Apple - wymagane dla iOS
    SignInWithApple: {
      // clientId to Bundle ID aplikacji dla natywnego iOS
      // Services ID (pl.rezerwacja24.auth.web) jest używany tylko dla web OAuth
      clientId: 'pl.rezerwacja24.app'
    }
  }
};

export default config;
