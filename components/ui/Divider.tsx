import { StyleSheet, View, type ViewProps } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

type DividerProps = {
  thickness?: number
  marginVertical?: number
} & Omit<ViewProps, 'accessibilityRole'>

export function Divider({ thickness, marginVertical, style, ...props }: DividerProps) {
  const { tokens } = useTheme()

  const styles = StyleSheet.create({
    divider: {
      height: thickness ?? StyleSheet.hairlineWidth,
      backgroundColor: tokens.colors.border,
      marginVertical: marginVertical ?? tokens.spacing.sm,
    },
  })

  return <View style={[styles.divider, style]} {...props} />
}
