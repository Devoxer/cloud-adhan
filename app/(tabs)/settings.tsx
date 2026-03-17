import Constants from 'expo-constants'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { I18nManager, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { AthanSoundPicker } from '@/components/settings/AthanSoundPicker'
import { CalculationMethodPicker } from '@/components/settings/CalculationMethodPicker'
import { CityPicker } from '@/components/settings/CityPicker'
import { LanguagePicker } from '@/components/settings/LanguagePicker'
import { MadhabPicker } from '@/components/settings/MadhabPicker'
import { OEMBatteryGuide } from '@/components/settings/OEMBatteryGuide'
import { SettingsRow } from '@/components/settings/SettingsRow'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { ThemePicker } from '@/components/settings/ThemePicker'
import { AppText } from '@/components/ui/AppText'
import { SafeScreen } from '@/components/ui/SafeScreen'
import { WebContainer } from '@/components/ui/WebContainer'
import { CALCULATION_METHODS } from '@/constants/methods'
import { getSoundById } from '@/constants/sounds'
import { useLocation } from '@/hooks/useLocation'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import { Prayer } from '@/types/prayer'

const GITHUB_URL = 'https://github.com/cloud-athan/cloud-athan'

const NOTIFIABLE_PRAYERS = [
  Prayer.Fajr,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
] as const

export default function SettingsScreen() {
  const { t } = useTranslation()
  const { tokens, themePreference } = useTheme()

  // Settings store
  const calculationMethod = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)
  const notifications = useSettingsStore((s) => s.notifications)
  const setNotifications = useSettingsStore((s) => s.setNotifications)
  const athanSound = useSettingsStore((s) => s.athanSound)
  const fajrSound = useSettingsStore((s) => s.fajrSound)
  const language = useSettingsStore((s) => s.language)
  const arabicNumerals = useSettingsStore((s) => s.arabicNumerals)
  const setArabicNumerals = useSettingsStore((s) => s.setArabicNumerals)

  // Location store
  const cityName = useLocationStore((s) => s.cityName)
  const locationSource = useLocationStore((s) => s.source)

  // Display values
  const methodDisplay = CALCULATION_METHODS[calculationMethod]?.displayName ?? calculationMethod
  const madhabDisplay = t(madhab === 'hanafi' ? 'settings.madhabHanafi' : 'settings.madhabShafi')
  const athanSoundInfo = getSoundById(athanSound)
  const athanSoundDisplay = athanSoundInfo ? t(athanSoundInfo.nameKey) : athanSound
  const fajrSoundInfo = getSoundById(fajrSound)
  const fajrSoundDisplay = fajrSoundInfo ? t(fajrSoundInfo.nameKey) : fajrSound
  const locationDisplay = cityName
    ? `${t(locationSource === 'gps' ? 'settings.useGps' : 'settings.manualCity')}: ${cityName}`
    : t('settings.location')
  const themeDisplay = t(
    `settings.theme${themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}`,
  )
  const langDisplay = t(language === 'en' ? 'settings.languageEn' : 'settings.languageAr')
  const version = Constants.expoConfig?.version ?? '1.0.0'

  const [showMethodPicker, setShowMethodPicker] = useState(false)
  const [showMadhabPicker, setShowMadhabPicker] = useState(false)
  const [showAthanSoundPicker, setShowAthanSoundPicker] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [showBatteryGuide, setShowBatteryGuide] = useState(false)

  const { requestLocation } = useLocation()
  const { permissionGranted } = useNotifications()

  const handleTogglePrayer = useCallback(
    (prayer: Prayer, value: boolean) => {
      const current = useSettingsStore.getState().notifications
      setNotifications({ ...current, [prayer]: value })
    },
    [setNotifications],
  )

  const handleUseGps = useCallback(async () => {
    await requestLocation()
  }, [requestLocation])

  const handleOpenSource = useCallback(() => {
    Linking.openURL(GITHUB_URL)
  }, [])

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          paddingTop: tokens.spacing.lg,
          paddingBottom: tokens.spacing['2xl'],
        },
        restartNotice: {
          paddingHorizontal: tokens.spacing.md,
          paddingTop: tokens.spacing.xs,
        },
      }),
    [tokens],
  )

  return (
    <SafeScreen edges={['top']}>
      <WebContainer>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Prayer Section */}
          <SettingsSection title={t('settings.prayer')}>
            <SettingsRow
              variant="navigation"
              label={t('settings.calculationMethod')}
              value={methodDisplay}
              onPress={() => setShowMethodPicker((prev) => !prev)}
              accessibilityLabel={`${t('settings.calculationMethod')}, ${methodDisplay}`}
            />
            {showMethodPicker && (
              <CalculationMethodPicker onSelect={() => setShowMethodPicker(false)} />
            )}
            <SettingsRow
              variant="navigation"
              label={t('settings.madhab')}
              value={madhabDisplay}
              onPress={() => setShowMadhabPicker((prev) => !prev)}
              accessibilityLabel={`${t('settings.madhab')}, ${madhabDisplay}`}
            />
            {showMadhabPicker && <MadhabPicker onSelect={() => setShowMadhabPicker(false)} />}
          </SettingsSection>

          {/* Notifications Section — hidden on web (view-only) */}
          {Platform.OS !== 'web' && (
            <SettingsSection title={t('settings.notifications')}>
              {!permissionGranted && (
                <SettingsRow
                  variant="navigation"
                  label={t('permission.enableNotifications')}
                  onPress={() => Linking.openSettings()}
                  accessibilityLabel={t('permission.enableNotifications')}
                />
              )}
              {NOTIFIABLE_PRAYERS.map((prayer) => (
                <SettingsRow
                  key={prayer}
                  variant="toggle"
                  label={t(`prayer.${prayer}`)}
                  toggleValue={notifications[prayer]}
                  onToggleChange={(value) => handleTogglePrayer(prayer, value)}
                  accessibilityLabel={t(`prayer.${prayer}`)}
                />
              ))}
              <SettingsRow
                variant="navigation"
                label={t('settings.athanSound')}
                value={athanSoundDisplay}
                onPress={() => setShowAthanSoundPicker((prev) => !prev)}
                accessibilityLabel={`${t('settings.athanSound')}, ${athanSoundDisplay}`}
              />
              <SettingsRow
                variant="navigation"
                label={t('settings.fajrSound')}
                value={fajrSoundDisplay}
                onPress={() => setShowAthanSoundPicker((prev) => !prev)}
                accessibilityLabel={`${t('settings.fajrSound')}, ${fajrSoundDisplay}`}
              />
              {showAthanSoundPicker && (
                <AthanSoundPicker onSelect={() => setShowAthanSoundPicker(false)} />
              )}
              {Platform.OS === 'android' && (
                <SettingsRow
                  variant="navigation"
                  label={t('settings.batteryGuide')}
                  onPress={() => setShowBatteryGuide((prev) => !prev)}
                  accessibilityLabel={t('settings.batteryGuide')}
                />
              )}
              {showBatteryGuide && Platform.OS === 'android' && <OEMBatteryGuide />}
            </SettingsSection>
          )}

          {/* Location Section */}
          <SettingsSection title={t('settings.location')}>
            <SettingsRow
              variant="value"
              label={t('settings.location')}
              value={locationDisplay}
              accessibilityLabel={`${t('settings.location')}, ${locationDisplay}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.manualCity')}
              onPress={() => setShowCityPicker((prev) => !prev)}
              accessibilityLabel={t('settings.manualCity')}
            />
            {showCityPicker && <CityPicker onSelect={() => setShowCityPicker(false)} />}
            {locationSource === 'manual' && (
              <SettingsRow
                variant="navigation"
                label={t('settings.useGps')}
                onPress={handleUseGps}
                accessibilityLabel={t('settings.useGps')}
              />
            )}
          </SettingsSection>

          {/* Appearance Section */}
          <SettingsSection title={t('settings.appearance')}>
            <SettingsRow
              variant="navigation"
              label={t('settings.theme')}
              value={themeDisplay}
              onPress={() => setShowThemePicker((prev) => !prev)}
              accessibilityLabel={`${t('settings.theme')}, ${themeDisplay}`}
            />
            {showThemePicker && <ThemePicker onSelect={() => setShowThemePicker(false)} />}
            <SettingsRow
              variant="navigation"
              label={t('settings.language')}
              value={langDisplay}
              onPress={() => setShowLanguagePicker((prev) => !prev)}
              accessibilityLabel={`${t('settings.language')}, ${langDisplay}`}
            />
            {showLanguagePicker && <LanguagePicker onSelect={() => setShowLanguagePicker(false)} />}
            {(language === 'ar') !== I18nManager.isRTL && (
              <View style={styles.restartNotice}>
                <AppText variant="caption" color="warning">
                  {t('common.restartRequired')}
                </AppText>
              </View>
            )}
            <SettingsRow
              variant="toggle"
              label={t('settings.arabicNumerals')}
              toggleValue={arabicNumerals}
              onToggleChange={setArabicNumerals}
              accessibilityLabel={t('settings.arabicNumerals')}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title={t('settings.about')}>
            <SettingsRow
              variant="value"
              label={t('settings.version')}
              value={version}
              accessibilityLabel={`${t('settings.version')} ${version}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.openSource')}
              onPress={handleOpenSource}
              accessibilityLabel={t('settings.openSource')}
            />
            <SettingsRow
              variant="value"
              label={t('settings.privacy')}
              accessibilityLabel={t('settings.privacy')}
            />
          </SettingsSection>
        </ScrollView>
      </WebContainer>
    </SafeScreen>
  )
}
