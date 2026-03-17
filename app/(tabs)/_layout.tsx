import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'

export default function TabLayout() {
  const { tokens } = useTheme()
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.accent,
        tabBarInactiveTintColor: tokens.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.home'),
          tabBarLabel: ({ focused, color }) =>
            focused ? (
              <AppText
                variant="caption"
                style={{ color, fontWeight: tokens.typography.label.weight }}
              >
                {t('tab.home')}
              </AppText>
            ) : null,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: t('tab.qibla'),
          tabBarLabel: ({ focused, color }) =>
            focused ? (
              <AppText
                variant="caption"
                style={{ color, fontWeight: tokens.typography.label.weight }}
              >
                {t('tab.qibla')}
              </AppText>
            ) : null,
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab.settings'),
          tabBarLabel: ({ focused, color }) =>
            focused ? (
              <AppText
                variant="caption"
                style={{ color, fontWeight: tokens.typography.label.weight }}
              >
                {t('tab.settings')}
              </AppText>
            ) : null,
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
