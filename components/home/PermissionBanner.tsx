import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { Surface } from '@/components/ui/Surface'
import { useTheme } from '@/hooks/useTheme'

type PermissionBannerProps = {
  canAskAgain: boolean
  onRetry: () => void
}

export function PermissionBanner({ canAskAgain, onRetry }: PermissionBannerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const handleSetManually = () => {
    router.push('/(tabs)/settings')
  }

  const handleOpenSettings = () => {
    Linking.openSettings()
  }

  const styles = StyleSheet.create({
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: tokens.spacing.sm,
    },
    textContainer: {
      flex: 1,
      gap: tokens.spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: tokens.spacing.sm,
      marginTop: tokens.spacing.xs,
    },
    primaryButton: {
      backgroundColor: tokens.colors.accent,
      borderRadius: tokens.radii.sm,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
    },
    secondaryButton: {
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
    },
  })

  return (
    <Surface variant="elevated" borderRadius="md" padding="md">
      <View style={styles.content} accessibilityRole="alert">
        <Ionicons name="location-outline" size={24} color={tokens.colors.warning} />
        <View style={styles.textContainer}>
          <AppText variant="bodySmall" color="textSecondary">
            {t('home.locationDenied')}
          </AppText>
          <View style={styles.actions}>
            <Pressable
              onPress={handleSetManually}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && Platform.OS === 'ios' && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('home.setManually')}
              android_ripple={{ color: tokens.colors.accentSubtle }}
            >
              <AppText variant="label" color="onAccent">
                {t('home.setManually')}
              </AppText>
            </Pressable>
            {canAskAgain ? (
              <Pressable
                onPress={onRetry}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && Platform.OS === 'ios' && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('home.tryAgain')}
              >
                <AppText variant="label" color="accent">
                  {t('home.tryAgain')}
                </AppText>
              </Pressable>
            ) : Platform.OS === 'web' ? (
              <View style={styles.secondaryButton}>
                <AppText variant="bodySmall" color="textTertiary">
                  {t('home.enableLocationInBrowser')}
                </AppText>
              </View>
            ) : (
              <Pressable
                onPress={handleOpenSettings}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && Platform.OS === 'ios' && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('home.openSettings')}
              >
                <AppText variant="label" color="accent">
                  {t('home.openSettings')}
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Surface>
  )
}
