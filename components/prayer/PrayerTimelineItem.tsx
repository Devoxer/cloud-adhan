import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { AppText } from '@/components/ui/AppText'
import type { PrayerStateType } from '@/hooks/usePrayerStates'
import { useTheme } from '@/hooks/useTheme'
import type { Prayer } from '@/types/prayer'
import { formatTime } from '@/utils/format'

type PrayerTimelineItemProps = {
  prayer: Prayer
  time: Date
  state: PrayerStateType
  arabicNumerals: boolean
}

const STATE_ICONS: Record<PrayerStateType, keyof typeof Ionicons.glyphMap> = {
  passed: 'checkmark-circle',
  current: 'ellipse',
  next: 'notifications',
  upcoming: 'notifications-outline',
}

export function PrayerTimelineItem({
  prayer,
  time,
  state,
  arabicNumerals,
}: PrayerTimelineItemProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()
  const reduceMotion = useReducedMotion()
  const opacity = useSharedValue(1)

  // biome-ignore lint/correctness/useExhaustiveDependencies: state triggers animation on prayer state change
  useEffect(() => {
    if (reduceMotion) return
    opacity.value = 0.6
    opacity.value = withTiming(1, { duration: 300 })
  }, [state, reduceMotion, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const prayerName = t(`prayer.${prayer}`)
  const statusText = t(`timeline.${state}`)
  const formattedTime = formatTime(time, false, arabicNumerals)
  const a11yLabel = t('timeline.accessibility', {
    prayer: prayerName,
    time: formattedTime,
    status: statusText,
  })

  const textColor = getTextColor(state)
  const iconColor = tokens.colors[textColor]
  const isBold = state === 'current' || state === 'next'
  const textVariant = isBold ? 'h3' : 'body'
  const bgStyle = getBackgroundStyle(state, tokens)

  return (
    <Animated.View style={reduceMotion ? undefined : animatedStyle}>
      <View
        accessible
        accessibilityLabel={a11yLabel}
        style={[
          styles.row,
          { paddingVertical: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md },
          bgStyle,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={STATE_ICONS[state]} size={20} color={iconColor} />
        </View>
        <AppText
          variant={textVariant}
          color={textColor}
          style={[styles.prayerName, { marginLeft: tokens.spacing.sm }]}
        >
          {prayerName}
        </AppText>
        <AppText variant="bodySmall" color={textColor}>
          {formattedTime}
        </AppText>
      </View>
    </Animated.View>
  )
}

function getTextColor(
  state: PrayerStateType,
): 'textTertiary' | 'prayerCurrent' | 'prayerActive' | 'textPrimary' {
  switch (state) {
    case 'passed':
      return 'textTertiary'
    case 'current':
      return 'prayerCurrent'
    case 'next':
      return 'prayerActive'
    case 'upcoming':
      return 'textPrimary'
  }
}

function withAlpha(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getBackgroundStyle(
  state: PrayerStateType,
  tokens: { colors: { prayerCurrent: string; accentSubtle: string }; radii: { sm: number } },
) {
  if (state === 'current') {
    return {
      backgroundColor: withAlpha(tokens.colors.prayerCurrent, 0.15),
      borderRadius: tokens.radii.sm,
    }
  }
  if (state === 'next') {
    return {
      backgroundColor: tokens.colors.accentSubtle,
      borderRadius: tokens.radii.sm,
    }
  }
  return undefined
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  prayerName: {
    flex: 1,
  },
})
