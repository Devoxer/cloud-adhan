import { View } from 'react-native'

import { PrayerTimelineItem } from '@/components/prayer/PrayerTimelineItem'
import { Surface } from '@/components/ui/Surface'
import { usePrayerStates } from '@/hooks/usePrayerStates'
import { useSettingsStore } from '@/stores/settings'

type PrayerTimelineProps = {
  date?: Date
}

export function PrayerTimeline({ date }: PrayerTimelineProps = {}) {
  const states = usePrayerStates(date)
  const arabicNumerals = useSettingsStore((s) => s.arabicNumerals)

  if (!states) {
    return (
      <Surface borderRadius="md" padding="md">
        <View />
      </Surface>
    )
  }

  return (
    <Surface borderRadius="md" padding="md">
      <View accessibilityRole="list">
        {states.map((entry) => (
          <PrayerTimelineItem
            key={entry.prayer}
            prayer={entry.prayer}
            time={entry.time}
            state={entry.state}
            arabicNumerals={arabicNumerals}
          />
        ))}
      </View>
    </Surface>
  )
}
