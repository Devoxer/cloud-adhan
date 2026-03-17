import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { QiblaCompass } from '@/components/qibla/QiblaCompass'
import { AppText } from '@/components/ui/AppText'
import { SafeScreen } from '@/components/ui/SafeScreen'
import { WebContainer } from '@/components/ui/WebContainer'
import { useQibla } from '@/hooks/useQibla'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'

export default function QiblaScreen() {
  const { t } = useTranslation()
  const { tokens } = useTheme()
  const coordinates = useLocationStore((s) => s.coordinates)
  const cityName = useLocationStore((s) => s.cityName)
  const { qiblaBearing, compassHeading, facingQibla, needsCalibration, isCompassAvailable } =
    useQibla()

  if (!coordinates) {
    return (
      <SafeScreen edges={['top']}>
        <WebContainer>
          <View style={styles.container}>
            <AppText variant="h2" color="textPrimary">
              {t('screen.qibla')}
            </AppText>
            <View style={{ marginTop: tokens.spacing.lg }}>
              <AppText variant="body" color="textSecondary" style={styles.centered}>
                {t('qibla.noLocation')}
              </AppText>
            </View>
          </View>
        </WebContainer>
      </SafeScreen>
    )
  }

  const accessibilityLabel = qiblaBearing
    ? t('qibla.compassAccessibility', { degrees: Math.round(qiblaBearing) })
    : t('screen.qibla')

  return (
    <SafeScreen edges={['top']}>
      <WebContainer>
        <View style={styles.container}>
          <AppText variant="h2" color="textPrimary" style={styles.title}>
            {t('screen.qibla')}
          </AppText>

          <View
            style={[styles.compassContainer, { marginTop: tokens.spacing.xl }]}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="image"
          >
            <QiblaCompass
              qiblaBearing={qiblaBearing}
              compassHeading={compassHeading}
              facingQibla={facingQibla}
              needsCalibration={needsCalibration}
              isCompassAvailable={isCompassAvailable}
            />
          </View>

          <View style={[styles.info, { marginTop: tokens.spacing.lg }]}>
            {cityName && (
              <AppText variant="body" color="textSecondary" style={styles.centered}>
                {cityName}
              </AppText>
            )}
            {qiblaBearing !== null && (
              <AppText
                variant="bodySmall"
                color="textTertiary"
                style={[styles.centered, { marginTop: tokens.spacing.xs }]}
              >
                {t('qibla.bearing', { degrees: Math.round(qiblaBearing) })}
              </AppText>
            )}
          </View>
        </View>
      </WebContainer>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
})
