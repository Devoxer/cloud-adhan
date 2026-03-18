import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'
import { Prayer } from '@/types/prayer'

const PRAYER_ROWS: Prayer[] = [
  Prayer.Fajr,
  Prayer.Sunrise,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
]

const MIN_ADJUSTMENT = -30
const MAX_ADJUSTMENT = 30

export function PrayerAdjustmentsPicker() {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const prayerAdjustments = useSettingsStore((s) => s.prayerAdjustments)
  const setPrayerAdjustment = useSettingsStore((s) => s.setPrayerAdjustment)
  const resetPrayerAdjustments = useSettingsStore((s) => s.resetPrayerAdjustments)

  const allZero = useMemo(
    () => Object.values(prayerAdjustments).every((v) => v === 0),
    [prayerAdjustments],
  )

  const handleIncrement = useCallback(
    (prayer: Prayer) => {
      const current = prayerAdjustments[prayer]
      if (current < MAX_ADJUSTMENT) {
        setPrayerAdjustment(prayer, current + 1)
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    },
    [prayerAdjustments, setPrayerAdjustment],
  )

  const handleDecrement = useCallback(
    (prayer: Prayer) => {
      const current = prayerAdjustments[prayer]
      if (current > MIN_ADJUSTMENT) {
        setPrayerAdjustment(prayer, current - 1)
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    },
    [prayerAdjustments, setPrayerAdjustment],
  )

  const handleReset = useCallback(() => {
    resetPrayerAdjustments()
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [resetPrayerAdjustments])

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: tokens.spacing.sm,
        },
        resetContainer: {
          alignItems: 'flex-end',
          marginBottom: tokens.spacing.xs,
        },
        resetButton: {
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.radii.sm,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radii.md,
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
        },
        prayerName: {
          flex: 1,
        },
        stepper: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        },
        stepperButton: {
          width: 36,
          height: 36,
          borderRadius: 999,
          backgroundColor: tokens.colors.accent,
          justifyContent: 'center',
          alignItems: 'center',
        },
        stepperButtonDisabled: {
          opacity: 0.3,
        },
        valueDisplay: {
          minWidth: 60,
          textAlign: 'center',
        },
      }),
    [tokens],
  )

  return (
    <View style={styles.container}>
      <View style={styles.resetContainer}>
        <Pressable
          onPress={handleReset}
          disabled={allZero}
          accessibilityRole="button"
          accessibilityLabel={t('settings.resetAdjustments')}
          accessibilityState={{ disabled: allZero }}
          style={[styles.resetButton, allZero && { opacity: 0.3 }]}
        >
          <AppText variant="label" color="accent">
            {t('settings.resetAdjustments')}
          </AppText>
        </Pressable>
      </View>

      {PRAYER_ROWS.map((prayer) => {
        const value = prayerAdjustments[prayer]
        const atMin = value <= MIN_ADJUSTMENT
        const atMax = value >= MAX_ADJUSTMENT
        const prayerLabel = t(`prayer.${prayer}`)

        return (
          <View key={prayer} style={styles.row}>
            <AppText variant="body" style={styles.prayerName}>
              {prayerLabel}
            </AppText>

            <View style={styles.stepper}>
              <Pressable
                onPress={() => handleDecrement(prayer)}
                disabled={atMin}
                accessibilityRole="button"
                accessibilityLabel={t('settings.decreaseAdjustment', { prayer: prayerLabel })}
                style={[styles.stepperButton, atMin && styles.stepperButtonDisabled]}
              >
                <AppText variant="body" color="onAccent">
                  -
                </AppText>
              </Pressable>

              <AppText variant="label" style={styles.valueDisplay}>
                {value === 0
                  ? t('settings.minuteFormat', { value: 0 })
                  : value > 0
                    ? t('settings.minuteFormatPositive', { value })
                    : t('settings.minuteFormat', { value })}
              </AppText>

              <Pressable
                onPress={() => handleIncrement(prayer)}
                disabled={atMax}
                accessibilityRole="button"
                accessibilityLabel={t('settings.increaseAdjustment', { prayer: prayerLabel })}
                style={[styles.stepperButton, atMax && styles.stepperButtonDisabled]}
              >
                <AppText variant="body" color="onAccent">
                  +
                </AppText>
              </Pressable>
            </View>
          </View>
        )
      })}
    </View>
  )
}
