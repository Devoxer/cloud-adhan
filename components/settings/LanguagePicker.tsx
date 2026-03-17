import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'
import type { Language } from '@/types/prayer'

type LanguagePickerProps = {
  onSelect?: () => void
}

type LanguageOption = {
  key: Language
  nameKey: string
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { key: 'en', nameKey: 'settings.languageEn' },
  { key: 'ar', nameKey: 'settings.languageAr' },
]

export function LanguagePicker({ onSelect }: LanguagePickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const language = useSettingsStore((s) => s.language)

  const handleSelect = useCallback(
    (key: Language) => {
      useSettingsStore.getState().setLanguage(key)
      const option = LANGUAGE_OPTIONS.find((o) => o.key === key)
      if (option) {
        AccessibilityInfo.announceForAccessibility(
          `${t('settings.language')}: ${t(option.nameKey)}`,
        )
      }
      onSelect?.()
    },
    [t, onSelect],
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
      {LANGUAGE_OPTIONS.map((option) => {
        const isSelected = language === option.key
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
