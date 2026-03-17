import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { IconButton } from '@/components/ui/IconButton'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/stores/settings'
import { formatNumber } from '@/utils/format'

type DateNavigatorProps = {
  selectedDate: Date
  isToday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onGoToToday: () => void
}

export function DateNavigator({
  selectedDate,
  isToday,
  onPreviousDay,
  onNextDay,
  onGoToToday,
}: DateNavigatorProps) {
  const { t } = useTranslation()
  const { tokens } = useTheme()
  const language = useSettingsStore((s) => s.language)
  const arabicNumerals = useSettingsStore((s) => s.arabicNumerals)

  const locale = language === 'ar' ? 'ar' : 'en'
  const formatted = dayjs(selectedDate).locale(locale).format(t('date.dateFormat'))

  // Replace day number with Arabic-Indic if enabled
  const displayDate = arabicNumerals
    ? formatted.replace(/\d+/g, (match) => formatNumber(match, true))
    : formatted

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: tokens.spacing.xs,
    },
    dateContainer: {
      flex: 1,
      alignItems: 'center',
    },
    todayButton: {
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
    },
  })

  return (
    <View style={styles.container} accessibilityRole="header">
      <IconButton
        icon={(props) => <Ionicons name="chevron-back" {...props} />}
        onPress={onPreviousDay}
        accessibilityLabel={t('date.previousDay')}
        size={20}
      />
      <View style={styles.dateContainer}>
        <AppText variant="body" color="textPrimary" accessibilityLiveRegion="polite">
          {displayDate}
        </AppText>
      </View>
      <IconButton
        icon={(props) => <Ionicons name="chevron-forward" {...props} />}
        onPress={onNextDay}
        accessibilityLabel={t('date.nextDay')}
        size={20}
      />
      {!isToday && (
        <Pressable
          onPress={onGoToToday}
          style={styles.todayButton}
          accessibilityRole="button"
          accessibilityLabel={t('date.goToToday')}
        >
          <AppText variant="label" color="accent">
            {t('home.today')}
          </AppText>
        </Pressable>
      )}
    </View>
  )
}
