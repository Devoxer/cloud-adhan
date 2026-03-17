import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { IconButton } from '@/components/ui/IconButton'
import { type AthanSound, getAthanSounds, getFajrSounds, getSoundById } from '@/constants/sounds'
import { useTheme } from '@/hooks/useTheme'
import { audioPreviewService } from '@/services/audio'
import { useSettingsStore } from '@/stores/settings'

interface AthanSoundPickerProps {
  onSelect?: () => void
}

export function AthanSoundPicker({ onSelect }: AthanSoundPickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const athanSound = useSettingsStore((s) => s.athanSound)
  const fajrSound = useSettingsStore((s) => s.fajrSound)
  const setAthanSound = useSettingsStore((s) => s.setAthanSound)
  const setFajrSound = useSettingsStore((s) => s.setFajrSound)

  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null)

  useEffect(() => {
    return () => audioPreviewService.stopPreview()
  }, [])

  const handlePreviewToggle = useCallback(
    (soundId: string) => {
      if (playingSoundId === soundId) {
        audioPreviewService.stopPreview()
        setPlayingSoundId(null)
      } else {
        audioPreviewService.playPreview(soundId, () => {
          setPlayingSoundId(null)
        })
        setPlayingSoundId(soundId)
      }
    },
    [playingSoundId],
  )

  const handleSelectAthan = useCallback(
    (soundId: string) => {
      setAthanSound(soundId)
      const sound = getSoundById(soundId)
      if (sound) {
        AccessibilityInfo.announceForAccessibility(
          `${t('settings.athanSound')}: ${t(sound.nameKey)}`,
        )
      }
      onSelect?.()
    },
    [setAthanSound, t, onSelect],
  )

  const handleSelectFajr = useCallback(
    (soundId: string) => {
      setFajrSound(soundId)
      const sound = getSoundById(soundId)
      if (sound) {
        AccessibilityInfo.announceForAccessibility(
          `${t('settings.fajrSound')}: ${t(sound.nameKey)}`,
        )
      }
      onSelect?.()
    },
    [setFajrSound, t, onSelect],
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
      }),
    [tokens],
  )

  const renderSoundRow = (
    sound: AthanSound,
    isSelected: boolean,
    onSelect: (id: string) => void,
  ) => {
    const isCurrentlyPlaying = playingSoundId === sound.id
    const soundName = t(sound.nameKey)

    return (
      <Pressable
        key={sound.id}
        onPress={() => onSelect(sound.id)}
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
        </View>
      </Pressable>
    )
  }

  return (
    <View>
      <View style={styles.section}>
        <View accessible accessibilityRole="header" style={styles.sectionHeader}>
          <AppText variant="h3">{t('settings.athanSound')}</AppText>
        </View>
        {getAthanSounds().map((sound) =>
          renderSoundRow(sound, athanSound === sound.id, handleSelectAthan),
        )}
      </View>

      <View style={styles.gap} />

      <View style={styles.section}>
        <View accessible accessibilityRole="header" style={styles.sectionHeader}>
          <AppText variant="h3">{t('settings.fajrSound')}</AppText>
        </View>
        {getFajrSounds().map((sound) =>
          renderSoundRow(sound, fajrSound === sound.id, handleSelectFajr),
        )}
      </View>
    </View>
  )
}
