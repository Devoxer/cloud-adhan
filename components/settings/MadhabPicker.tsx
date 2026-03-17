import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'
import type { Madhab } from '@/types/prayer'

type MadhabPickerProps = {
  onSelect?: () => void
}

type MadhabOption = {
  key: Madhab
  nameKey: string
  descKey: string
}

const MADHAB_OPTIONS: MadhabOption[] = [
  { key: 'hanafi', nameKey: 'settings.madhabHanafi', descKey: 'settings.madhabHanafiDesc' },
  { key: 'shafi', nameKey: 'settings.madhabShafi', descKey: 'settings.madhabShafiDesc' },
]

export function MadhabPicker({ onSelect }: MadhabPickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const madhab = useSettingsStore((s) => s.madhab)
  const setMadhab = useSettingsStore((s) => s.setMadhab)

  const handleSelect = useCallback(
    (key: Madhab) => {
      setMadhab(key)
      const option = MADHAB_OPTIONS.find((o) => o.key === key)
      if (option) {
        AccessibilityInfo.announceForAccessibility(`${t('settings.madhab')}: ${t(option.nameKey)}`)
      }
      onSelect?.()
    },
    [setMadhab, t, onSelect],
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
      {MADHAB_OPTIONS.map((option) => {
        const isSelected = madhab === option.key
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
