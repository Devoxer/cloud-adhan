import * as Haptics from 'expo-haptics'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'

const COMPASS_SIZE = 280
const TICK_COUNT = 12
const TICK_LENGTH = 12
const TICK_WIDTH = 2
const CARDINAL_OFFSET = 28
const QIBLA_INDICATOR_SIZE = 24
// Intentionally theme-independent: calibration overlays use dark backdrop for readability on both themes
const CALIBRATION_BACKDROP = 'rgba(0,0,0,0.7)'

function shortestRotation(current: number, target: number): number {
  'worklet'
  let diff = target - current
  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360
  return current + diff
}

type Props = {
  qiblaBearing: number | null
  compassHeading: number | null
  facingQibla: boolean
  needsCalibration: boolean
  isCompassAvailable: boolean
}

export function QiblaCompass({
  qiblaBearing,
  compassHeading,
  facingQibla,
  needsCalibration,
  isCompassAvailable,
}: Props) {
  const { t } = useTranslation()
  const { tokens } = useTheme()
  const reduceMotion = useReducedMotion()

  // --- Haptic feedback (Task 2) ---
  const wasFacingQibla = useRef(false)

  useEffect(() => {
    if (facingQibla && !wasFacingQibla.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
    wasFacingQibla.current = facingQibla
  }, [facingQibla])

  // --- Compass rotation animation (Task 1) ---
  const currentRotation = useSharedValue(0)
  const manualOffset = useSharedValue(0)

  useEffect(() => {
    if (compassHeading === null) return
    const targetRotation = -compassHeading
    const smoothTarget = shortestRotation(currentRotation.value, targetRotation)
    currentRotation.value = reduceMotion
      ? smoothTarget
      : withTiming(smoothTarget, {
          duration: 150,
          easing: Easing.out(Easing.quad),
        })
  }, [compassHeading, reduceMotion, currentRotation])

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${currentRotation.value + manualOffset.value}deg` }],
  }))

  // --- Facing Qibla indicator animation (Task 2) ---
  const facingOpacity = useSharedValue(0)

  useEffect(() => {
    facingOpacity.value = facingQibla
      ? reduceMotion
        ? 1
        : withTiming(1, { duration: 300 })
      : reduceMotion
        ? 0
        : withTiming(0, { duration: 300 })
  }, [facingQibla, reduceMotion, facingOpacity])

  const facingStyle = useAnimatedStyle(() => ({
    opacity: facingOpacity.value,
  }))

  // --- Gesture Handler for manual mode (Task 3) ---
  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      'worklet'
      const offsetDegrees = (event.rotation * 180) / Math.PI
      manualOffset.value = offsetDegrees
    })
    .onEnd(() => {
      'worklet'
      manualOffset.value = withTiming(0, { duration: 300 })
    })

  // --- Calibration animation (Task 4) ---
  const calibrationProgress = useSharedValue(0)

  useEffect(() => {
    if (needsCalibration && !reduceMotion) {
      calibrationProgress.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      )
    } else {
      calibrationProgress.value = 0
    }
  }, [needsCalibration, reduceMotion, calibrationProgress])

  const calibrationDotStyle = useAnimatedStyle(() => {
    const t = calibrationProgress.value
    // Simple figure-8 Lissajous curve: x = sin(2*pi*t), y = sin(4*pi*t)
    const x = Math.sin(t * 2 * Math.PI) * 30
    const y = Math.sin(t * 4 * Math.PI) * 15
    return {
      transform: [{ translateX: x }, { translateY: y }],
    }
  })

  // --- Render ---
  const tealColor = tokens.colors.qiblaDirection
  const borderColor = tokens.colors.border
  const bgColor = tokens.colors.surface
  const textSecondary = tokens.colors.textSecondary

  const cardinals = ['N', 'E', 'S', 'W'] as const
  const cardinalAngles = [0, 90, 180, 270]

  // Static fallback (Task 5): no magnetometer available
  if (!isCompassAvailable) {
    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.compassOuter,
            {
              borderColor,
              backgroundColor: bgColor,
            },
          ]}
        >
          {/* Tick marks */}
          {Array.from({ length: TICK_COUNT }).map((_, i) => {
            const angle = i * 30
            return (
              <View
                key={`tick-${angle}`}
                style={[
                  styles.tick,
                  {
                    backgroundColor: textSecondary,
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -(COMPASS_SIZE / 2 - TICK_LENGTH / 2 - 4) },
                    ],
                  },
                ]}
              />
            )
          })}

          {/* Cardinal labels */}
          {cardinals.map((label, i) => {
            const angle = cardinalAngles[i]
            const rad = ((angle - 90) * Math.PI) / 180
            const r = COMPASS_SIZE / 2 - CARDINAL_OFFSET
            return (
              <View
                key={label}
                style={[
                  styles.cardinalContainer,
                  {
                    transform: [
                      { translateX: Math.cos(rad) * r },
                      { translateY: Math.sin(rad) * r },
                    ],
                  },
                ]}
              >
                <AppText variant="label" color={label === 'N' ? 'qiblaDirection' : 'textSecondary'}>
                  {label}
                </AppText>
              </View>
            )
          })}

          {/* Static Qibla arrow */}
          {qiblaBearing !== null && (
            <View
              style={[
                styles.qiblaArrow,
                {
                  backgroundColor: tealColor,
                  transform: [
                    { rotate: `${qiblaBearing}deg` },
                    { translateY: -(COMPASS_SIZE / 2 - 40) },
                  ],
                },
              ]}
            />
          )}

          {/* Center text */}
          {qiblaBearing !== null && (
            <AppText variant="h3" color="qiblaDirection">
              {t('qibla.bearingDegrees', { degrees: Math.round(qiblaBearing) })}
            </AppText>
          )}
        </View>

        <View style={[styles.fallbackLabel, { marginTop: tokens.spacing.md }]}>
          <AppText variant="bodySmall" color="textSecondary">
            {t('qibla.staticFallback')}
          </AppText>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      {/* Calibration overlay (Task 4) */}
      {needsCalibration && (
        <View style={[styles.calibrationOverlay, { backgroundColor: CALIBRATION_BACKDROP }]}>
          <AppText
            variant="body"
            color="textPrimary"
            style={[styles.calibrationText, { paddingHorizontal: tokens.spacing.lg }]}
          >
            {t('qibla.needsCalibration')}
          </AppText>
          {!reduceMotion && (
            <Animated.View
              style={[
                styles.calibrationDot,
                { backgroundColor: tealColor, marginTop: tokens.spacing.md },
                calibrationDotStyle,
              ]}
            />
          )}
        </View>
      )}

      {/* Compass with gesture handler (Task 3) */}
      <GestureDetector gesture={rotationGesture}>
        <Animated.View
          style={[
            styles.compassOuter,
            {
              borderColor,
              backgroundColor: bgColor,
            },
            compassStyle,
          ]}
        >
          {/* Tick marks at 30deg intervals */}
          {Array.from({ length: TICK_COUNT }).map((_, i) => {
            const angle = i * 30
            return (
              <View
                key={`tick-${angle}`}
                testID={`tick-${angle}`}
                style={[
                  styles.tick,
                  {
                    backgroundColor: textSecondary,
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -(COMPASS_SIZE / 2 - TICK_LENGTH / 2 - 4) },
                    ],
                  },
                ]}
              />
            )
          })}

          {/* Cardinal direction labels */}
          {cardinals.map((label, i) => {
            const angle = cardinalAngles[i]
            const rad = ((angle - 90) * Math.PI) / 180
            const r = COMPASS_SIZE / 2 - CARDINAL_OFFSET
            return (
              <View
                key={label}
                style={[
                  styles.cardinalContainer,
                  {
                    transform: [
                      { translateX: Math.cos(rad) * r },
                      { translateY: Math.sin(rad) * r },
                    ],
                  },
                ]}
              >
                <AppText variant="label" color={label === 'N' ? 'qiblaDirection' : 'textSecondary'}>
                  {label}
                </AppText>
              </View>
            )
          })}

          {/* Qibla indicator at bearing angle */}
          {qiblaBearing !== null && (
            <View
              style={[
                styles.qiblaIndicator,
                {
                  backgroundColor: tealColor,
                  transform: [
                    { rotate: `${qiblaBearing}deg` },
                    { translateY: -(COMPASS_SIZE / 2 - 20) },
                  ],
                },
              ]}
            />
          )}
        </Animated.View>
      </GestureDetector>

      {/* Center heading display (overlaid on top of compass) */}
      <View style={styles.centerOverlay} pointerEvents="none">
        {compassHeading !== null && (
          <AppText variant="h2" color="textPrimary">
            {`${Math.round(compassHeading)}°`}
          </AppText>
        )}
      </View>

      {/* Facing Qibla indicator (Task 2) */}
      <Animated.View
        style={[
          styles.facingIndicator,
          {
            backgroundColor: tealColor,
            borderRadius: tokens.radii.md,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            marginTop: tokens.spacing.md,
          },
          facingStyle,
        ]}
        accessibilityElementsHidden={!facingQibla}
        importantForAccessibility={facingQibla ? 'yes' : 'no-hide-descendants'}
      >
        <AppText variant="label" color="onAccent">
          {t('qibla.facingQibla')}
        </AppText>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: TICK_WIDTH,
    height: TICK_LENGTH,
    borderRadius: 1,
  },
  cardinalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qiblaIndicator: {
    position: 'absolute',
    width: QIBLA_INDICATOR_SIZE,
    height: QIBLA_INDICATOR_SIZE,
    borderRadius: QIBLA_INDICATOR_SIZE / 2,
  },
  qiblaArrow: {
    position: 'absolute',
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  centerOverlay: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facingIndicator: {
    alignItems: 'center',
  },
  calibrationOverlay: {
    position: 'absolute',
    top: 0,
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationText: {
    textAlign: 'center',
  },
  calibrationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fallbackLabel: {
    alignItems: 'center',
  },
})
