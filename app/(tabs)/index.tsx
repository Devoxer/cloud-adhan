import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'

import { DateNavigator } from '@/components/home/DateNavigator'
import { HomeScreenSkeleton } from '@/components/home/HomeScreenSkeleton'
import { PermissionBanner } from '@/components/home/PermissionBanner'
import { CountdownHero } from '@/components/prayer/CountdownHero'
import { PrayerTimeline } from '@/components/prayer/PrayerTimeline'
import { SafeScreen } from '@/components/ui/SafeScreen'
import { WebContainer } from '@/components/ui/WebContainer'
import { useFirstLaunch } from '@/hooks/useFirstLaunch'
import { useNotificationReceived } from '@/hooks/useNotificationReceived'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'

export default function HomeScreen() {
  const { tokens } = useTheme()
  const { loading, error, canAskAgain, retry } = useFirstLaunch()
  const { reschedule } = useNotifications()
  useNotificationReceived(reschedule)
  const coordinates = useLocationStore((s) => s.coordinates)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')

  const goToNextDay = useCallback(() => {
    setSelectedDate((prev) => dayjs(prev).add(1, 'day').toDate())
  }, [])

  const goToPrevDay = useCallback(() => {
    setSelectedDate((prev) => dayjs(prev).subtract(1, 'day').toDate())
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  // Keyboard arrow navigation for web (fling gestures aren't discoverable on desktop)
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable)
        return
      if (e.key === 'ArrowLeft') goToPrevDay()
      if (e.key === 'ArrowRight') goToNextDay()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevDay, goToNextDay])

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onStart(() => runOnJS(goToNextDay)())

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onStart(() => runOnJS(goToPrevDay)())

  const composed = Gesture.Race(flingLeft, flingRight)

  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: tokens.spacing.md,
      paddingTop: tokens.spacing.sm,
      paddingBottom: tokens.spacing.xl,
      gap: tokens.spacing.lg,
    },
    gestureContainer: {
      flex: 1,
    },
  })

  // Loading state
  if (loading) {
    return (
      <SafeScreen edges={['top']}>
        <WebContainer>
          <HomeScreenSkeleton />
        </WebContainer>
      </SafeScreen>
    )
  }

  // No coordinates and permission denied
  if (!coordinates && error) {
    return (
      <SafeScreen edges={['top']}>
        <WebContainer>
          <View style={styles.content}>
            <PermissionBanner canAskAgain={canAskAgain} onRetry={retry} />
          </View>
        </WebContainer>
      </SafeScreen>
    )
  }

  // Main content
  return (
    <SafeScreen edges={['top']}>
      <WebContainer>
        <GestureDetector gesture={composed}>
          <View style={styles.gestureContainer}>
            <ScrollView contentContainerStyle={styles.content}>
              <DateNavigator
                selectedDate={selectedDate}
                isToday={isToday}
                onPreviousDay={goToPrevDay}
                onNextDay={goToNextDay}
                onGoToToday={goToToday}
              />
              {isToday && <CountdownHero />}
              <PrayerTimeline date={selectedDate} />
            </ScrollView>
          </View>
        </GestureDetector>
      </WebContainer>
    </SafeScreen>
  )
}
