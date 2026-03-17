import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { Surface } from '@/components/ui/Surface'
import { useTheme } from '@/hooks/useTheme'

type SettingsSectionProps = {
  title: string
  children: ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { tokens } = useTheme()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: tokens.spacing.xl,
        },
        header: {
          paddingHorizontal: tokens.spacing.lg,
          marginBottom: tokens.spacing.sm,
        },
      }),
    [tokens],
  )

  return (
    <View style={styles.container}>
      <View accessible accessibilityRole="header" style={styles.header}>
        <AppText variant="h3" color="textSecondary">
          {title}
        </AppText>
      </View>
      <Surface variant="default" borderRadius="md" padding="none">
        {children}
      </Surface>
    </View>
  )
}
