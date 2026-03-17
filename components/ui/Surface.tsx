import { Platform, Pressable, StyleSheet, View, type ViewProps } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import type { RadiiTokens, SpacingTokens } from '@/theme/types'

type SurfaceVariant = 'default' | 'elevated'

type SurfaceBaseProps = {
  variant?: SurfaceVariant
  borderRadius?: keyof RadiiTokens | 'none'
  padding?: keyof SpacingTokens | 'none'
}

type SurfaceStaticProps = SurfaceBaseProps & {
  onPress?: never
  accessibilityLabel?: string
}

type SurfacePressableProps = SurfaceBaseProps & {
  onPress: () => void
  accessibilityLabel: string
}

type SurfaceProps = (SurfaceStaticProps | SurfacePressableProps) &
  Omit<ViewProps, 'accessibilityRole'>

const backgroundMap: Record<SurfaceVariant, 'surface' | 'surfaceElevated'> = {
  default: 'surface',
  elevated: 'surfaceElevated',
}

export function Surface({
  variant = 'default',
  borderRadius = 'md',
  padding = 'md',
  onPress,
  style,
  children,
  accessibilityLabel,
  ...props
}: SurfaceProps) {
  const { tokens } = useTheme()

  const styles = StyleSheet.create({
    container: {
      backgroundColor: tokens.colors[backgroundMap[variant]],
      borderRadius: borderRadius === 'none' ? 0 : tokens.radii[borderRadius],
      padding: padding === 'none' ? 0 : tokens.spacing[padding],
    },
  })

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          styles.container,
          pressed && Platform.OS === 'ios' && { opacity: 0.7 },
          style,
        ]}
        android_ripple={{ color: tokens.colors.accentSubtle }}
        {...props}
      >
        {children}
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  )
}
