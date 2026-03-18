import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'

type ElevationRulePickerProps = {
  onSelect?: () => void
}

type ElevationOption = {
  key: 'seaLevel' | 'automatic'
  nameKey: string
  descKey: string
}

const ELEVATION_OPTIONS: ElevationOption[] = [
  {
    key: 'seaLevel',
    nameKey: 'settings.elevationSeaLevel',
    descKey: 'settings.elevationSeaLevelDesc',
  },
  {
    key: 'automatic',
    nameKey: 'settings.elevationAutomatic',
    descKey: 'settings.elevationAutomaticDesc',
  },
]

export function ElevationRulePicker({ onSelect }: ElevationRulePickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const elevationRule = useSettingsStore((s) => s.elevationRule)
  const setElevationRule = useSettingsStore((s) => s.setElevationRule)

  const handleSelect = useCallback(
    (key: 'automatic' | 'seaLevel') => {
      setElevationRule(key)
      const option = ELEVATION_OPTIONS.find((o) => o.key === key)
      if (option) {
        AccessibilityInfo.announceForAccessibility(
          `${t('settings.elevationRule')}: ${t(option.nameKey)}`,
        )
      }
      onSelect?.()
    },
    [setElevationRule, t, onSelect],
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
      }),
    [tokens],
  )

  return (
    <View style={styles.container}>
      {ELEVATION_OPTIONS.map((option) => {
        const isSelected = elevationRule === option.key
        const name = t(option.nameKey)

        return (
          <Pressable
            key={option.key}
            onPress={() => handleSelect(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={name}
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
                <AppText variant="body">{name}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t(option.descKey)}
                </AppText>
              </View>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
