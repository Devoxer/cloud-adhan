import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import Constants from 'expo-constants'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { AthanSoundPicker } from '@/components/settings/AthanSoundPicker'
import { CalculationMethodPicker } from '@/components/settings/CalculationMethodPicker'
import { CityPicker } from '@/components/settings/CityPicker'
import { ElevationRulePicker } from '@/components/settings/ElevationRulePicker'
import { LanguagePicker } from '@/components/settings/LanguagePicker'
import { MadhabPicker } from '@/components/settings/MadhabPicker'
import { OEMBatteryGuide } from '@/components/settings/OEMBatteryGuide'
import { PrayerAdjustmentsPicker } from '@/components/settings/PrayerAdjustmentsPicker'
import { ReminderOffsetPicker } from '@/components/settings/ReminderOffsetPicker'
import { SettingsRow } from '@/components/settings/SettingsRow'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { ThemePicker } from '@/components/settings/ThemePicker'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { SafeScreen } from '@/components/ui/SafeScreen'
import { WebContainer } from '@/components/ui/WebContainer'
import { CALCULATION_METHODS } from '@/constants/methods'
import { getSoundById } from '@/constants/sounds'
import { useLocation } from '@/hooks/useLocation'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import { type NotifiablePrayer, Prayer } from '@/types/prayer'

const GITHUB_URL = 'https://github.com/cloud-athan/cloud-athan'

const NOTIFIABLE_PRAYERS = [
  Prayer.Fajr,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
] as const

type SheetType =
  | 'method'
  | 'madhab'
  | 'sound'
  | 'city'
  | 'theme'
  | 'language'
  | 'battery'
  | 'adjustments'
  | 'elevation'
  | 'reminderOffset'

const SNAP_POINTS: Record<SheetType, (string | number)[]> = {
  city: ['50%', '90%'],
  sound: ['75%'],
  method: ['60%'],
  battery: ['80%'],
  madhab: ['35%'],
  theme: ['35%'],
  language: ['35%'],
  adjustments: ['70%'],
  elevation: ['35%'],
  reminderOffset: ['40%'],
}

const SHEET_TITLE_KEYS: Partial<Record<SheetType, string>> = {
  method: 'settings.calculationMethod',
  madhab: 'settings.madhab',
  city: 'settings.manualCity',
  theme: 'settings.theme',
  language: 'settings.language',
  adjustments: 'settings.prayerAdjustments',
  elevation: 'settings.elevationRule',
  reminderOffset: 'settings.reminderOffset',
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const { tokens, themePreference } = useTheme()

  // Settings store
  const calculationMethod = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)
  const notifications = useSettingsStore((s) => s.notifications)
  const setNotifications = useSettingsStore((s) => s.setNotifications)
  const prayerSounds = useSettingsStore((s) => s.prayerSounds)
  const prayerAdjustments = useSettingsStore((s) => s.prayerAdjustments)
  const reminders = useSettingsStore((s) => s.reminders)
  const setReminderEnabled = useSettingsStore((s) => s.setReminderEnabled)
  const elevationRule = useSettingsStore((s) => s.elevationRule)
  const language = useSettingsStore((s) => s.language)
  const arabicNumerals = useSettingsStore((s) => s.arabicNumerals)
  const setArabicNumerals = useSettingsStore((s) => s.setArabicNumerals)

  // Location store
  const cityName = useLocationStore((s) => s.cityName)
  const locationSource = useLocationStore((s) => s.source)

  // Display values
  const methodDisplay = CALCULATION_METHODS[calculationMethod]?.displayName ?? calculationMethod
  const madhabDisplay = t(madhab === 'hanafi' ? 'settings.madhabHanafi' : 'settings.madhabShafi')
  const locationDisplay = cityName
    ? `${t(locationSource === 'gps' ? 'settings.useGps' : 'settings.manualCity')}: ${cityName}`
    : t('settings.location')
  const themeDisplay = t(
    `settings.theme${themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}`,
  )
  const langDisplay = t(language === 'en' ? 'settings.languageEn' : 'settings.languageAr')
  const adjustmentCount = Object.values(prayerAdjustments).filter((v) => v !== 0).length
  const adjustmentDisplay =
    adjustmentCount === 0
      ? t('settings.adjustmentsNone')
      : t('settings.adjustmentsCount', { count: adjustmentCount })
  const elevationDisplay = t(
    elevationRule === 'automatic' ? 'settings.elevationAutomatic' : 'settings.elevationSeaLevel',
  )
  const version = Constants.expoConfig?.version ?? '1.0.0'

  // Bottom sheet controller
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [activeSheet, setActiveSheet] = useState<SheetType | null>(null)
  const [soundPickerPrayer, setSoundPickerPrayer] = useState<NotifiablePrayer>(Prayer.Fajr)
  const [reminderOffsetPrayer, setReminderOffsetPrayer] = useState<NotifiablePrayer>(Prayer.Fajr)

  const openSheet = useCallback((sheet: SheetType) => {
    setActiveSheet(sheet)
  }, [])

  const openSoundSheet = useCallback((prayer: NotifiablePrayer) => {
    setSoundPickerPrayer(prayer)
    setActiveSheet('sound')
  }, [])

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss()
  }, [])

  const handleSheetDismiss = useCallback(() => {
    setActiveSheet(null)
  }, [])

  // Present the sheet after activeSheet and snapPoints are committed to avoid snap point race
  useEffect(() => {
    if (activeSheet) {
      bottomSheetRef.current?.present()
    }
  }, [activeSheet])

  const snapPoints = useMemo(
    () => (activeSheet ? SNAP_POINTS[activeSheet] : ['50%']),
    [activeSheet],
  )

  const titleKey = activeSheet ? SHEET_TITLE_KEYS[activeSheet] : undefined
  const sheetTitle = titleKey ? t(titleKey) : undefined

  const { requestLocation } = useLocation()
  const { permissionGranted } = useNotifications()

  const handleTogglePrayer = useCallback(
    (prayer: NotifiablePrayer, value: boolean) => {
      const current = useSettingsStore.getState().notifications
      setNotifications({ ...current, [prayer]: value })
    },
    [setNotifications],
  )

  const handleToggleReminder = useCallback(
    (prayer: NotifiablePrayer, value: boolean) => {
      setReminderEnabled(prayer, value)
    },
    [setReminderEnabled],
  )

  const openReminderOffsetSheet = useCallback((prayer: NotifiablePrayer) => {
    setReminderOffsetPrayer(prayer)
    setActiveSheet('reminderOffset')
  }, [])

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
        reminderIndent: {
          paddingStart: tokens.spacing.lg,
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
              onPress={() => openSheet('method')}
              accessibilityLabel={`${t('settings.calculationMethod')}, ${methodDisplay}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.madhab')}
              value={madhabDisplay}
              onPress={() => openSheet('madhab')}
              accessibilityLabel={`${t('settings.madhab')}, ${madhabDisplay}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.prayerAdjustments')}
              value={adjustmentDisplay}
              onPress={() => openSheet('adjustments')}
              accessibilityLabel={`${t('settings.prayerAdjustments')}, ${adjustmentDisplay}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.elevationRule')}
              value={elevationDisplay}
              onPress={() => openSheet('elevation')}
              accessibilityLabel={`${t('settings.elevationRule')}, ${elevationDisplay}`}
            />
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
              {NOTIFIABLE_PRAYERS.map((prayer) => {
                const soundInfo = getSoundById(prayerSounds[prayer])
                const soundDisplay = soundInfo ? t(soundInfo.nameKey) : prayerSounds[prayer]
                const soundLabel = t(`settings.${prayer}SoundLabel`)
                return (
                  <Fragment key={prayer}>
                    <SettingsRow
                      variant="toggle"
                      label={t(`prayer.${prayer}`)}
                      toggleValue={notifications[prayer]}
                      onToggleChange={(value) => handleTogglePrayer(prayer, value)}
                      accessibilityLabel={t(`prayer.${prayer}`)}
                    />
                    {notifications[prayer] && (
                      <>
                        <SettingsRow
                          variant="navigation"
                          label={soundLabel}
                          value={soundDisplay}
                          onPress={() => openSoundSheet(prayer)}
                          accessibilityLabel={`${soundLabel}, ${soundDisplay}`}
                        />
                        <View style={styles.reminderIndent}>
                          <SettingsRow
                            variant="toggle"
                            label={t('settings.reminder')}
                            toggleValue={reminders[prayer].enabled}
                            onToggleChange={(value) => handleToggleReminder(prayer, value)}
                            accessibilityLabel={`${t('settings.reminder')} ${t(`prayer.${prayer}`)}`}
                          />
                          {reminders[prayer].enabled && (
                            <SettingsRow
                              variant="navigation"
                              label={t('settings.reminderOffset')}
                              value={t('settings.reminderMinutesBefore', {
                                count: reminders[prayer].minutes,
                              })}
                              onPress={() => openReminderOffsetSheet(prayer)}
                              accessibilityLabel={`${t('settings.reminderOffset')} ${t(`prayer.${prayer}`)}, ${t('settings.reminderMinutesBefore', { count: reminders[prayer].minutes })}`}
                            />
                          )}
                        </View>
                      </>
                    )}
                  </Fragment>
                )
              })}
              {Platform.OS === 'android' && (
                <SettingsRow
                  variant="navigation"
                  label={t('settings.batteryGuide')}
                  onPress={() => openSheet('battery')}
                  accessibilityLabel={t('settings.batteryGuide')}
                />
              )}
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
              onPress={() => openSheet('city')}
              accessibilityLabel={t('settings.manualCity')}
            />
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
              onPress={() => openSheet('theme')}
              accessibilityLabel={`${t('settings.theme')}, ${themeDisplay}`}
            />
            <SettingsRow
              variant="navigation"
              label={t('settings.language')}
              value={langDisplay}
              onPress={() => openSheet('language')}
              accessibilityLabel={`${t('settings.language')}, ${langDisplay}`}
            />
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

        {/* Bottom Sheet — rendered outside ScrollView */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          title={sheetTitle}
          onDismiss={handleSheetDismiss}
          scrollable={activeSheet !== 'city'}
        >
          {activeSheet === 'method' && <CalculationMethodPicker onSelect={closeSheet} />}
          {activeSheet === 'madhab' && <MadhabPicker onSelect={closeSheet} />}
          {activeSheet === 'sound' && (
            <AthanSoundPicker prayer={soundPickerPrayer} onSelect={closeSheet} />
          )}
          {activeSheet === 'city' && <CityPicker onSelect={closeSheet} />}
          {activeSheet === 'theme' && <ThemePicker onSelect={closeSheet} />}
          {activeSheet === 'language' && <LanguagePicker onSelect={closeSheet} />}
          {activeSheet === 'battery' && <OEMBatteryGuide />}
          {activeSheet === 'adjustments' && <PrayerAdjustmentsPicker />}
          {activeSheet === 'elevation' && <ElevationRulePicker onSelect={closeSheet} />}
          {activeSheet === 'reminderOffset' && (
            <ReminderOffsetPicker prayer={reminderOffsetPrayer} onSelect={closeSheet} />
          )}
        </BottomSheet>
      </WebContainer>
    </SafeScreen>
  )
}
