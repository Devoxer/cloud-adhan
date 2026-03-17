import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import { I18nManager, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { Toggle } from '@/components/ui/Toggle'
import { useTheme } from '@/hooks/useTheme'

type SettingsRowBaseProps = {
  label: string
  value?: string
  accessibilityLabel: string
}

type ToggleRowProps = SettingsRowBaseProps & {
  variant: 'toggle'
  toggleValue: boolean
  onToggleChange: (value: boolean) => void
  onPress?: never
}

type NavigationRowProps = SettingsRowBaseProps & {
  variant: 'navigation'
  onPress?: () => void
  toggleValue?: never
  onToggleChange?: never
}

type ValueRowProps = SettingsRowBaseProps & {
  variant: 'value'
  onPress?: () => void
  toggleValue?: never
  onToggleChange?: never
}

type SettingsRowProps = ToggleRowProps | NavigationRowProps | ValueRowProps

export function SettingsRow(props: SettingsRowProps) {
  const { label, value, variant, accessibilityLabel } = props
  const { tokens } = useTheme()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          minHeight: 48,
        },
        label: {
          flex: 1,
        },
        endContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        },
      }),
    [tokens],
  )

  if (variant === 'toggle') {
    return (
      <View style={styles.container}>
        <AppText variant="body" style={styles.label}>
          {label}
        </AppText>
        <Toggle
          value={props.toggleValue}
          onChange={props.onToggleChange}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    )
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && Platform.OS === 'ios' && { opacity: 0.7 },
      ]}
      android_ripple={{ color: tokens.colors.accentSubtle }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={props.onPress}
    >
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.endContainer}>
        {value != null && (
          <AppText variant="bodySmall" color="textSecondary">
            {value}
          </AppText>
        )}
        {variant === 'navigation' && (
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color={tokens.colors.textTertiary}
          />
        )}
      </View>
    </Pressable>
  )
}
