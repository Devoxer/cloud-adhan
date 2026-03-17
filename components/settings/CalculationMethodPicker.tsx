import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { CALCULATION_METHODS } from '@/constants/methods'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import type { CalculationMethod } from '@/types/prayer'
import { getRecommendedMethod } from '@/utils/region'

type CalculationMethodPickerProps = {
  onSelect?: () => void
}

const methods = Object.values(CALCULATION_METHODS)

export function CalculationMethodPicker({ onSelect }: CalculationMethodPickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const calculationMethod = useSettingsStore((s) => s.calculationMethod)
  const setCalculationMethod = useSettingsStore((s) => s.setCalculationMethod)
  const coordinates = useLocationStore((s) => s.coordinates)

  const recommendedMethod = useMemo(
    () => (coordinates ? getRecommendedMethod(coordinates.latitude, coordinates.longitude) : null),
    [coordinates],
  )

  const handleSelect = useCallback(
    (key: CalculationMethod) => {
      setCalculationMethod(key)
      const method = CALCULATION_METHODS[key]
      if (method) {
        AccessibilityInfo.announceForAccessibility(
          `${t('settings.calculationMethod')}: ${method.displayName}`,
        )
      }
      onSelect?.()
    },
    [setCalculationMethod, t, onSelect],
  )

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: tokens.spacing.xs,
        },
        row: {
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing.md,
        },
        rowSelected: {
          backgroundColor: tokens.colors.surfaceElevated,
        },
        rowContent: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: tokens.spacing.sm,
        },
        radio: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: tokens.colors.textTertiary,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 2,
        },
        radioSelected: {
          borderColor: tokens.colors.accent,
        },
        radioDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: tokens.colors.accent,
        },
        textContainer: {
          flex: 1,
        },
        recommended: {
          color: tokens.colors.teal,
        },
      }),
    [tokens],
  )

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = calculationMethod === method.key
        const isRecommended = recommendedMethod === method.key

        return (
          <Pressable
            key={method.key}
            onPress={() => handleSelect(method.key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={method.displayName}
            style={({ pressed }) => [
              styles.row,
              isSelected && styles.rowSelected,
              pressed && Platform.OS === 'ios' && { opacity: 0.7 },
            ]}
            android_ripple={{ color: tokens.colors.accentSubtle }}
          >
            <View style={styles.rowContent}>
              <View
                style={[styles.radio, isSelected && styles.radioSelected]}
                accessibilityElementsHidden
              >
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <View style={styles.textContainer}>
                <AppText variant="body">{method.displayName}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {method.description}
                </AppText>
                <AppText variant="caption" color="textTertiary">
                  {method.regions.join(' · ')}
                </AppText>
                {isRecommended && (
                  <AppText variant="caption" style={styles.recommended}>
                    {t('settings.recommendedForRegion')}
                  </AppText>
                )}
              </View>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
