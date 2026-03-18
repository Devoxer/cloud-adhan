import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { IconButton } from '@/components/ui/IconButton'
import {
  type AthanSound,
  getSoundById,
  getSoundsByCategory,
  type SoundCategory,
} from '@/constants/sounds'
import { useTheme } from '@/hooks/useTheme'
import { audioPreviewService } from '@/services/audio'
import { useSettingsStore } from '@/stores/settings'
import type { NotifiablePrayer } from '@/types/prayer'

const CATEGORY_TITLE_KEYS: Record<SoundCategory, string> = {
  athan: 'settings.categoryAthan',
  tone: 'settings.categoryTone',
  vibration: 'settings.categoryVibration',
  special: 'settings.categorySpecial',
  silent: 'settings.categorySilent',
}

interface AthanSoundPickerProps {
  prayer: NotifiablePrayer
  onSelect?: () => void
}

export function AthanSoundPicker({ prayer, onSelect }: AthanSoundPickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const selectedSoundId = useSettingsStore((s) => s.prayerSounds[prayer])
  const setPrayerSound = useSettingsStore((s) => s.setPrayerSound)

  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null)
  const [loadingSoundId, setLoadingSoundId] = useState<string | null>(null)
  const [errorSoundId, setErrorSoundId] = useState<string | null>(null)

  const categoryGroups = useMemo(() => getSoundsByCategory(), [])

  useEffect(() => {
    return () => audioPreviewService.stopPreview()
  }, [])

  const handlePreviewToggle = useCallback(
    (soundId: string) => {
      setErrorSoundId(null)

      if (playingSoundId === soundId || loadingSoundId === soundId) {
        audioPreviewService.stopPreview()
        setPlayingSoundId(null)
        setLoadingSoundId(null)
      } else {
        setLoadingSoundId(soundId)
        setPlayingSoundId(null)

        audioPreviewService
          .playPreview(soundId, {
            onAutoStop: () => {
              setPlayingSoundId(null)
            },
            onError: () => {
              setLoadingSoundId(null)
              setPlayingSoundId(null)
              setErrorSoundId(soundId)
              AccessibilityInfo.announceForAccessibility(t('settings.previewFailed'))
            },
          })
          .then(() => {
            if (audioPreviewService.currentSoundId === soundId) {
              setLoadingSoundId(null)
              setPlayingSoundId(soundId)
            }
          })
          .catch(() => {
            // Error already handled via onError callback
          })
      }
    },
    [playingSoundId, loadingSoundId, t],
  )

  const handleSelect = useCallback(
    (soundId: string) => {
      setPrayerSound(prayer, soundId)
      const sound = getSoundById(soundId)
      if (sound) {
        AccessibilityInfo.announceForAccessibility(`${t(`prayer.${prayer}`)}: ${t(sound.nameKey)}`)
      }
      onSelect?.()
    },
    [setPrayerSound, prayer, t, onSelect],
  )

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          gap: tokens.spacing.sm,
        },
        sectionHeader: {
          paddingStart: tokens.spacing.xs,
          marginBottom: tokens.spacing.xs,
        },
        row: {
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing.md,
        },
        rowSelected: {
          backgroundColor: tokens.colors.surfaceElevated,
        },
        rowContent: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
        },
        radio: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: tokens.colors.textTertiary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        radioSelected: {
          borderColor: tokens.colors.accent,
        },
        radioDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: tokens.colors.accent,
        },
        label: {
          flex: 1,
        },
        gap: {
          height: tokens.spacing.lg,
        },
        errorText: {
          paddingStart: 28 + tokens.spacing.sm,
        },
      }),
    [tokens],
  )

  const renderSoundRow = (sound: AthanSound) => {
    const isSelected = selectedSoundId === sound.id
    const isCurrentlyPlaying = playingSoundId === sound.id
    const isLoading = loadingSoundId === sound.id
    const hasError = errorSoundId === sound.id
    const soundName = t(sound.nameKey)

    return (
      <View key={sound.id}>
        <Pressable
          onPress={() => handleSelect(sound.id)}
          accessibilityRole="radio"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={soundName}
          style={({ pressed }) => [
            styles.row,
            isSelected && styles.rowSelected,
            pressed && Platform.OS === 'ios' && { opacity: 0.7 },
          ]}
          android_ripple={{ color: tokens.colors.accentSubtle }}
        >
          <View style={styles.rowContent}>
            <View
              style={[styles.radio, isSelected && styles.radioSelected]}
              accessibilityElementsHidden
            >
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <AppText variant="body" style={styles.label}>
              {soundName}
            </AppText>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={tokens.colors.accent}
                accessibilityLabel={t('common.loading')}
              />
            ) : (
              <IconButton
                icon={({ color, size }) => (
                  <Ionicons
                    name={isCurrentlyPlaying ? 'stop-circle-outline' : 'play-circle-outline'}
                    size={size}
                    color={isCurrentlyPlaying ? tokens.colors.teal : color}
                  />
                )}
                onPress={() => handlePreviewToggle(sound.id)}
                accessibilityLabel={
                  isCurrentlyPlaying
                    ? t('settings.stopPreview')
                    : t('settings.previewSound', { name: soundName })
                }
              />
            )}
          </View>
        </Pressable>
        {hasError && (
          <View style={styles.errorText}>
            <AppText variant="caption" color="error">
              {t('settings.previewFailed')}
            </AppText>
          </View>
        )}
      </View>
    )
  }

  return (
    <View>
      {categoryGroups.map((group, index) => (
        <View key={group.category}>
          {index > 0 && <View style={styles.gap} />}
          <View style={styles.section}>
            <View accessible accessibilityRole="header" style={styles.sectionHeader}>
              <AppText variant="h3">{t(CATEGORY_TITLE_KEYS[group.category])}</AppText>
            </View>
            {group.sounds.map(renderSoundRow)}
          </View>
        </View>
      ))}
    </View>
  )
}
