import { StyleSheet, type ViewProps } from 'react-native'
import { type Edge, SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import type { ColorTokens } from '@/theme/types'

type SafeScreenProps = {
  edges?: Edge[]
  backgroundColor?: keyof ColorTokens
} & Omit<ViewProps, 'accessibilityRole'>

export function SafeScreen({
  edges,
  backgroundColor = 'background',
  style,
  children,
  ...props
}: SafeScreenProps) {
  const { tokens } = useTheme()

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: tokens.colors[backgroundColor],
    },
  })

  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]} {...props}>
      {children}
    </SafeAreaView>
  )
}
