import * as Haptics from 'expo-haptics'
import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  I18nManager,
  Pressable,
  StyleSheet,
  type ViewProps,
} from 'react-native'

import { useTheme } from '@/hooks/useTheme'

const TRACK_WIDTH = 50
const TRACK_HEIGHT = 30
const THUMB_SIZE = 26
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4 // 4 = 2px padding each side

type ToggleProps = {
  value: boolean
  onChange: (value: boolean) => void
  accessibilityLabel: string
  disabled?: boolean
} & Omit<ViewProps, 'accessibilityRole' | 'accessibilityState'>

export function Toggle({
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  style,
  ...props
}: ToggleProps) {
  const { tokens } = useTheme()
  const thumbPosition = useRef(new Animated.Value(value ? 1 : 0)).current
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  useEffect(() => {
    Animated.timing(thumbPosition, {
      toValue: value ? 1 : 0,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: false,
    }).start()
  }, [value, thumbPosition, reduceMotion])

  const handleToggle = () => {
    if (disabled) return
    Haptics.selectionAsync()
    onChange(!value)
  }

  const translateX = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: I18nManager.isRTL ? [THUMB_TRAVEL, 0] : [0, THUMB_TRAVEL],
  })

  const trackColor = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.colors.textTertiary, tokens.colors.accent],
  })

  const styles = StyleSheet.create({
    touchTarget: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    track: {
      width: TRACK_WIDTH,
      height: TRACK_HEIGHT,
      borderRadius: TRACK_HEIGHT / 2,
      justifyContent: 'center',
      paddingStart: 2,
      paddingEnd: 2,
    },
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
    },
  })

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={[styles.touchTarget, { opacity: disabled ? 0.4 : 1 }, style]}
      {...props}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: value ? tokens.colors.onAccent : tokens.colors.surface,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  )
}
