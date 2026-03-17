import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'
import type { ThemePreference } from '@/theme/types'

type ThemePickerProps = {
  onSelect?: () => void
}

type ThemeOption = {
  key: ThemePreference
  nameKey: string
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'dark', nameKey: 'settings.themeDark' },
  { key: 'light', nameKey: 'settings.themeLight' },
  { key: 'system', nameKey: 'settings.themeSystem' },
]

export function ThemePicker({ onSelect }: ThemePickerProps) {
  const { t } = useTranslation()
  const { tokens, themePreference, setThemePreference } = useTheme()

  const handleSelect = useCallback(
    (key: ThemePreference) => {
      setThemePreference(key)
      const option = THEME_OPTIONS.find((o) => o.key === key)
      if (option) {
        AccessibilityInfo.announceForAccessibility(`${t('settings.theme')}: ${t(option.nameKey)}`)
      }
      onSelect?.()
    },
    [setThemePreference, t, onSelect],
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
          alignItems: 'center',
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
      }),
    [tokens],
  )

  return (
    <View style={styles.container}>
      {THEME_OPTIONS.map((option) => {
        const isSelected = themePreference === option.key
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
              <AppText variant="body">{name}</AppText>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
