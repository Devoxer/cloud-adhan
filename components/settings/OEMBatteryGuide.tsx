import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { Surface } from '@/components/ui/Surface'
import { useTheme } from '@/hooks/useTheme'
import { getDeviceManufacturer, isAndroid } from '@/utils/platform'

interface OEMGuide {
  slug: string
  steps: string[]
}

const XIAOMI_GUIDE: OEMGuide = {
  slug: 'xiaomi',
  steps: [
    'Open Settings > Apps > Manage Apps > Cloud Athan > Battery Saver > No restrictions',
    'Open Settings > Battery & Performance > App Battery Saver > Cloud Athan > No restrictions',
    'Lock the app in recent apps (swipe down on app card)',
  ],
}

const HUAWEI_GUIDE: OEMGuide = {
  slug: 'huawei',
  steps: [
    'Open Settings > Battery > App Launch > Cloud Athan > Manage Manually > Enable Auto-launch, Secondary launch, Run in background',
    'Open Settings > Apps > Cloud Athan > Battery > Enable "Allow background activity"',
  ],
}

const OPPO_GUIDE: OEMGuide = {
  slug: 'oppo',
  steps: [
    "Open Settings > Battery > More Battery Settings > Optimize battery use > Cloud Athan > Don't optimize",
    'Lock the app in recent apps',
  ],
}

const OEM_GUIDES: Record<string, OEMGuide> = {
  samsung: {
    slug: 'samsung',
    steps: [
      'Open Settings > Apps > Cloud Athan > Battery > Unrestricted',
      'Open Settings > Device Care > Battery > Background usage limits > Never sleeping apps > Add Cloud Athan',
      'Disable "Adaptive Battery" in Settings > Device Care > Battery',
    ],
  },
  xiaomi: XIAOMI_GUIDE,
  redmi: XIAOMI_GUIDE,
  huawei: HUAWEI_GUIDE,
  honor: HUAWEI_GUIDE,
  oneplus: {
    slug: 'oneplus',
    steps: [
      "Open Settings > Battery > Battery Optimization > Cloud Athan > Don't optimize",
      'Open Settings > Apps > Cloud Athan > Battery > Allow background activity',
    ],
  },
  oppo: OPPO_GUIDE,
  realme: OPPO_GUIDE,
  vivo: {
    slug: 'vivo',
    steps: [
      'Open Settings > Battery > Background power consumption management > Cloud Athan > Allow',
      'Open Settings > Apps > Cloud Athan > Battery > Allow background activity',
    ],
  },
}

const GENERIC_GUIDE: OEMGuide = {
  slug: '',
  steps: [
    "Open Settings > Battery > Battery optimization > Cloud Athan > Don't optimize",
    'If notifications stop working, visit dontkillmyapp.com for device-specific instructions',
  ],
}

export function OEMBatteryGuide() {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: tokens.spacing.sm,
        },
        header: {
          paddingStart: tokens.spacing.xs,
        },
        stepRow: {
          flexDirection: 'row',
          gap: tokens.spacing.sm,
          alignItems: 'flex-start',
        },
        stepNumber: {
          minWidth: 20,
        },
        stepText: {
          flex: 1,
        },
        learnMore: {
          paddingTop: tokens.spacing.xs,
        },
      }),
    [tokens],
  )

  if (!isAndroid()) return null

  const manufacturer = getDeviceManufacturer()

  const guide = manufacturer ? (OEM_GUIDES[manufacturer] ?? GENERIC_GUIDE) : GENERIC_GUIDE
  const displayName = manufacturer
    ? manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1)
    : null

  const learnMoreUrl = guide.slug
    ? `https://dontkillmyapp.com/${guide.slug}`
    : 'https://dontkillmyapp.com'

  return (
    <View style={styles.container}>
      <View accessible accessibilityRole="header" style={styles.header}>
        <AppText variant="h3">
          {displayName
            ? t('settings.batteryGuideTitle', { manufacturer: displayName })
            : t('settings.batteryGuideGeneric')}
        </AppText>
      </View>
      <Surface>
        {guide.steps.map((step, index) => (
          <View key={step} accessible accessibilityRole="text" style={styles.stepRow}>
            <AppText variant="body" style={styles.stepNumber}>
              {`${index + 1}.`}
            </AppText>
            <AppText variant="body" style={styles.stepText}>
              {step}
            </AppText>
          </View>
        ))}
        <Pressable
          onPress={() => Linking.openURL(learnMoreUrl)}
          accessibilityRole="link"
          accessibilityLabel={t('settings.learnMore')}
          android_ripple={{ color: tokens.colors.accentSubtle }}
          style={({ pressed }) => [
            styles.learnMore,
            pressed && Platform.OS === 'ios' && { opacity: 0.7 },
          ]}
        >
          <AppText variant="bodySmall" color="accent">
            {t('settings.learnMore')}
          </AppText>
        </Pressable>
      </Surface>
    </View>
  )
}
