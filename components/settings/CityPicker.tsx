import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { CITIES, type CityInfo } from '@/constants/cities'
import { useTheme } from '@/hooks/useTheme'
import { useLocationStore } from '@/stores/location'
import { captureError } from '@/utils/sentry'

type CityPickerProps = {
  onSelect?: () => void
}

export function CityPicker({ onSelect }: CityPickerProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()

  const coordinates = useLocationStore((s) => s.coordinates)

  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)

  const filteredCities = useMemo(
    () =>
      query ? CITIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())) : CITIES,
    [query],
  )

  const handleSelect = useCallback(
    (city: CityInfo) => {
      try {
        useLocationStore
          .getState()
          .setLocation({ latitude: city.latitude, longitude: city.longitude }, city.name, 'manual')
        setError(false)
        AccessibilityInfo.announceForAccessibility(t('settings.citySelected', { city: city.name }))
        onSelect?.()
      } catch (e) {
        captureError(e, { component: 'CityPicker', operation: 'handleSelect' })
        setError(true)
        AccessibilityInfo.announceForAccessibility(t('settings.citySelectionFailed'))
      }
    },
    [t, onSelect],
  )

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          gap: tokens.spacing.xs,
        },
        searchInput: {
          backgroundColor: tokens.colors.surfaceElevated,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing.md,
          color: tokens.colors.textPrimary,
          fontSize: tokens.typography.body.size,
          textAlign: 'auto',
          writingDirection: 'ltr',
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
          alignItems: 'flex-start',
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
          marginTop: 2,
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
        textContainer: {
          flex: 1,
        },
        emptyContainer: {
          padding: tokens.spacing.lg,
          alignItems: 'center',
        },
        errorText: {
          paddingHorizontal: tokens.spacing.xs,
        },
      }),
    [tokens],
  )

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <AppText variant="body" color="textSecondary">
          {t('settings.noCitiesFound')}
        </AppText>
      </View>
    ),
    [styles.emptyContainer, t],
  )

  const renderItem = useCallback(
    ({ item }: { item: CityInfo }) => {
      const isSelected =
        coordinates !== null &&
        item.latitude === coordinates.latitude &&
        item.longitude === coordinates.longitude

      return (
        <Pressable
          onPress={() => handleSelect(item)}
          accessibilityRole="radio"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={`${item.name}, ${item.country}`}
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
            <View style={styles.textContainer}>
              <AppText variant="body">{item.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {item.country}
              </AppText>
            </View>
          </View>
        </Pressable>
      )
    },
    [coordinates, handleSelect, styles, tokens.colors.accentSubtle],
  )

  return (
    <View style={styles.container}>
      <BottomSheetTextInput
        style={styles.searchInput}
        placeholder={t('settings.searchCities')}
        placeholderTextColor={tokens.colors.textTertiary}
        value={query}
        onChangeText={setQuery}
        accessibilityLabel={t('settings.searchCities')}
        autoCapitalize="words"
        autoCorrect={false}
      />
      {error && (
        <View style={styles.errorText}>
          <AppText variant="caption" color="error">
            {t('settings.citySelectionFailed')}
          </AppText>
        </View>
      )}
      <BottomSheetFlatList
        data={filteredCities}
        keyExtractor={(item: CityInfo) => item.key}
        renderItem={renderItem}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  )
}
