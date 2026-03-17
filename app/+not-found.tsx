import { Link, Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/hooks/useTheme'

export default function NotFoundScreen() {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  return (
    <>
      <Stack.Screen options={{ title: t('screen.notFound') }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('error.notFound')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: tokens.colors.accent }]}>
            {t('error.goHome')}
          </Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
})
