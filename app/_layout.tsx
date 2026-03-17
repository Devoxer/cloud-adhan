import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { router, Stack, useNavigationContainerRef } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useRef } from 'react'
import { I18nManager, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'

import { useTheme } from '@/hooks/useTheme'
import i18n from '@/i18n'
import { notificationService } from '@/services/notification'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import { ThemeProvider } from '@/theme/provider'
import { env } from '@/utils/env'
import { captureError } from '@/utils/sentry'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

I18nManager.allowRTL(true)

SplashScreen.preventAutoHideAsync()

const routingInstrumentation = Sentry.reactNavigationIntegration()

if (!__DEV__ && env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    enableAutoSessionTracking: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    enableNative: Platform.OS !== 'web',
    integrations: [routingInstrumentation],
    beforeSend(event) {
      const stripCoords = (obj: Record<string, unknown> | undefined) => {
        if (!obj) return
        delete obj.latitude
        delete obj.longitude
        delete obj.coordinates
      }
      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          stripCoords(breadcrumb.data as Record<string, unknown> | undefined)
        }
      }
      stripCoords(event.extra)
      if (event.contexts) {
        for (const ctx of Object.values(event.contexts)) {
          stripCoords(ctx as Record<string, unknown> | undefined)
        }
      }
      return event
    },
  })
}

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const shouldBeRTL = language === 'ar'
  const hasSyncedRef = useRef(false)
  const navigationRef = useNavigationContainerRef()

  useEffect(() => {
    if (navigationRef?.current) {
      routingInstrumentation.registerNavigationContainer(navigationRef)
    }
  }, [navigationRef])

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // Sync detected language to store on first launch, then keep i18next in sync with store
  useEffect(() => {
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true
      const detected = i18n.resolvedLanguage ?? i18n.language
      if ((detected === 'en' || detected === 'ar') && detected !== language) {
        setLanguage(detected)
        return
      }
    }
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
    // Keep HTML lang attribute in sync for web a11y and SEO
    if (Platform.OS === 'web') {
      document.documentElement.lang = language
    }
  }, [language, setLanguage])

  useEffect(() => {
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL)
      // I18nManager.forceRTL() requires app reload to take effect.
      // expo-updates is not installed; the change applies on next app launch.
    }
  }, [shouldBeRTL])

  // Initialize notification service and set up listeners (skip on web — view-only)
  useEffect(() => {
    if (Platform.OS === 'web') return

    notificationService.initialize()

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      const { coordinates } = useLocationStore.getState()
      if (!coordinates) return
      const { calculationMethod, madhab, notifications, athanSound, fajrSound } =
        useSettingsStore.getState()
      notificationService
        .reschedule({
          coordinates,
          calculationMethod,
          madhab,
          notifications,
          athanSound,
          fajrSound,
        })
        .catch((error: unknown) => {
          captureError(error, { listener: 'notificationReceived', operation: 'reschedule' })
        })
    })

    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/(tabs)')
    })

    return () => {
      receivedSub.remove()
      responseSub.remove()
    }
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

function RootLayoutNav() {
  const { resolvedTheme } = useTheme()

  return (
    <NavThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </NavThemeProvider>
  )
}

export default Sentry.wrap(RootLayout)
