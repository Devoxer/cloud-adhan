import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { AppText } from '@/components/ui/AppText'
import { useCountdown } from '@/hooks/useCountdown'
import { useNextPrayer } from '@/hooks/useNextPrayer'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'
import { formatNumber, formatTime } from '@/utils/format'

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function AnimatedDigit({
  value,
  color,
  typography,
  animate = true,
}: {
  value: string
  color: string
  typography: { size: number; weight: string; lineHeight: number }
  animate?: boolean
}) {
  const opacity = useSharedValue(1)
  const opacityRef = useRef(opacity)
  opacityRef.current = opacity

  // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers re-animation on countdown change
  useEffect(() => {
    if (!animate) return
    opacityRef.current.value = 0.6
    opacityRef.current.value = withTiming(1, { duration: 300 })
  }, [value, animate])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.Text
      style={[
        {
          fontSize: typography.size,
          fontWeight: typography.weight as '300',
          lineHeight: typography.size * typography.lineHeight,
          color,
        },
        animate ? animatedStyle : undefined,
      ]}
    >
      {value}
    </Animated.Text>
  )
}

export function CountdownHero() {
  const { t } = useTranslation()
  const { tokens } = useTheme()
  const reduceMotion = useReducedMotion()
  const arabicNumerals = useSettingsStore((s) => s.arabicNumerals)
  const nextPrayer = useNextPrayer()
  const { hours, minutes, seconds } = useCountdown(nextPrayer?.time ?? null)

  const accessibilityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accessibilityLabelRef = useRef('')

  useEffect(() => {
    const updateLabel = () => {
      if (!nextPrayer) {
        accessibilityLabelRef.current = ''
        return
      }
      const prayerName = t(`prayer.${nextPrayer.prayer}`)
      accessibilityLabelRef.current = t('countdown.accessibility', {
        prayer: prayerName,
        hours: String(hours),
        minutes: String(minutes),
      })
    }

    updateLabel()
    if (accessibilityIntervalRef.current) clearInterval(accessibilityIntervalRef.current)
    accessibilityIntervalRef.current = setInterval(updateLabel, 60_000)

    return () => {
      if (accessibilityIntervalRef.current) clearInterval(accessibilityIntervalRef.current)
    }
  }, [nextPrayer, hours, minutes, t])

  if (!nextPrayer) {
    return <View style={styles.container} />
  }

  const prayerName = t(`prayer.${nextPrayer.prayer}`)
  const prayerInLabel = t('common.prayerTimeIn', { prayer: prayerName })

  const showHours = hours > 0
  const formattedHours = formatNumber(padTwo(hours), arabicNumerals)
  const formattedMinutes = formatNumber(padTwo(minutes), arabicNumerals)
  const formattedSeconds = formatNumber(padTwo(seconds), arabicNumerals)

  const countdownTypo = tokens.typography.countdownLarge
  const accentColor = tokens.colors.accent

  return (
    <View
      style={[styles.container, { paddingTop: tokens.spacing['3xl'] }]}
      accessibilityRole="timer"
      accessibilityLabel={accessibilityLabelRef.current}
      {...(Platform.OS === 'android' ? { accessibilityLiveRegion: 'polite' as const } : {})}
    >
      <AppText variant="body" color="textSecondary" style={styles.prayerName}>
        {prayerInLabel}
      </AppText>

      <View style={styles.countdownRow}>
        {showHours && (
          <>
            <AnimatedDigit
              value={formattedHours}
              color={accentColor}
              typography={countdownTypo}
              animate={!reduceMotion}
            />
            <Animated.Text
              style={{
                fontSize: countdownTypo.size,
                fontWeight: countdownTypo.weight as '300',
                lineHeight: countdownTypo.size * countdownTypo.lineHeight,
                color: accentColor,
              }}
            >
              :
            </Animated.Text>
          </>
        )}
        <AnimatedDigit
          value={formattedMinutes}
          color={accentColor}
          typography={countdownTypo}
          animate={!reduceMotion}
        />
        <Animated.Text
          style={{
            fontSize: countdownTypo.size,
            fontWeight: countdownTypo.weight as '300',
            lineHeight: countdownTypo.size * countdownTypo.lineHeight,
            color: accentColor,
          }}
        >
          :
        </Animated.Text>
        <AnimatedDigit
          value={formattedSeconds}
          color={accentColor}
          typography={countdownTypo}
          animate={!reduceMotion}
        />
      </View>

      <AppText
        variant="bodySmall"
        color="textTertiary"
        style={[styles.exactTime, { marginTop: tokens.spacing.sm }]}
      >
        {formatTime(nextPrayer.time, false, arabicNumerals)}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  prayerName: {
    textAlign: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exactTime: {
    textAlign: 'center',
  },
})
