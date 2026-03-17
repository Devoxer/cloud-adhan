import type { ReactNode } from 'react'
import { Platform, Pressable, StyleSheet, type ViewProps } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import type { ColorTokens } from '@/theme/types'

type IconButtonProps = {
  icon: (props: { color: string; size: number }) => ReactNode
  onPress: () => void
  accessibilityLabel: string
  color?: keyof ColorTokens
  size?: number
  disabled?: boolean
} & Omit<ViewProps, 'accessibilityRole'>

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = 'textPrimary',
  size = 24,
  disabled = false,
  style,
  ...props
}: IconButtonProps) {
  const { tokens } = useTheme()

  const styles = StyleSheet.create({
    button: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      width: Math.max(size + 20, 44),
      height: Math.max(size + 20, 44),
    },
  })

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: disabled ? 0.4 : pressed && Platform.OS === 'ios' ? 0.7 : 1,
        },
        style,
      ]}
      android_ripple={
        disabled ? undefined : { color: tokens.colors.accentSubtle, borderless: true }
      }
      {...props}
    >
      {icon({ color: tokens.colors[color], size })}
    </Pressable>
  )
}
