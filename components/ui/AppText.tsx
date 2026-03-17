import { StyleSheet, Text, type TextProps } from 'react-native'

import { useTheme } from '@/hooks/useTheme'
import type { ColorTokens, TypographyTokens } from '@/theme/types'

type AppTextProps = {
  variant: keyof TypographyTokens
  color?: keyof ColorTokens
} & Omit<TextProps, 'accessibilityRole'>

export function AppText({ variant, color = 'textPrimary', style, ...props }: AppTextProps) {
  const { tokens } = useTheme()
  const typo = tokens.typography[variant]

  const styles = StyleSheet.create({
    text: {
      fontSize: typo.size,
      fontWeight: typo.weight,
      lineHeight: typo.size * typo.lineHeight,
      color: tokens.colors[color],
      textAlign: 'auto',
    },
  })

  return (
    <Text
      accessibilityRole="text"
      allowFontScaling={true}
      style={[styles.text, style]}
      {...props}
    />
  )
}
