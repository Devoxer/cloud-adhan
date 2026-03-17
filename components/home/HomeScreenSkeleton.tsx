import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/hooks/useTheme'

export function HomeScreenSkeleton() {
  const { tokens } = useTheme()
  const reduceMotion = useReducedMotion()
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
    }
  }, [reduceMotion, opacity])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.5 : opacity.value,
  }))

  const skeletonColor = tokens.colors.surfaceElevated

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: tokens.spacing.md,
      paddingTop: tokens.spacing.md,
      gap: tokens.spacing.lg,
    },
    dateBar: {
      height: 20,
      width: '60%',
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
      alignSelf: 'center',
    },
    heroContainer: {
      alignItems: 'center',
      gap: tokens.spacing.sm,
      paddingVertical: tokens.spacing.lg,
    },
    countdownBlock: {
      height: 56,
      width: '70%',
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
    },
    prayerNameBlock: {
      height: 22,
      width: '50%',
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
    },
    timeBlock: {
      height: 18,
      width: '40%',
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
    },
    timelineContainer: {
      borderRadius: tokens.radii.md,
      backgroundColor: tokens.colors.surface,
      padding: tokens.spacing.md,
      gap: tokens.spacing.md,
    },
    prayerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    prayerIcon: {
      height: 20,
      width: 20,
      borderRadius: tokens.radii.full,
      backgroundColor: skeletonColor,
    },
    prayerLabel: {
      height: 18,
      flex: 1,
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
    },
    prayerTime: {
      height: 18,
      width: 60,
      borderRadius: tokens.radii.sm,
      backgroundColor: skeletonColor,
    },
  })

  const SKELETON_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

  const prayerRows = SKELETON_KEYS.map((key) => (
    <View key={key} style={styles.prayerRow}>
      <View style={styles.prayerIcon} />
      <View style={styles.prayerLabel} />
      <View style={styles.prayerTime} />
    </View>
  ))

  return (
    <Animated.View
      style={[styles.container, pulseStyle]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      testID="home-screen-skeleton"
    >
      {/* Date bar */}
      <View style={styles.dateBar} />

      {/* Countdown hero */}
      <View style={styles.heroContainer}>
        <View style={styles.countdownBlock} />
        <View style={styles.prayerNameBlock} />
        <View style={styles.timeBlock} />
      </View>

      {/* Prayer timeline */}
      <View style={styles.timelineContainer}>{prayerRows}</View>
    </Animated.View>
  )
}
