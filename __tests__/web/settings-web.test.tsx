import { render, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import SettingsScreen from '@/app/(tabs)/settings'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const RN = jest.requireActual('react-native')
  return {
    SafeAreaView: RN.View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  }
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        background: '#000000',
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        onAccent: '#FFFFFF',
        warning: '#E8A838',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 },
      typography: {
        h1: { size: 28, weight: '600', lineHeight: 1.3 },
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
        caption: { size: 12, weight: '400', lineHeight: 1.4 },
      },
      radii: { sm: 8, md: 12, lg: 16, full: 9999 },
    },
    themePreference: 'dark',
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.prayer': 'Prayer',
        'settings.calculationMethod': 'Calculation Method',
        'settings.madhab': 'Madhab',
        'settings.madhabShafi': "Shafi'i",
        'settings.notifications': 'Notifications',
        'settings.athanSound': 'Athan Sound',
        'settings.fajrSound': 'Fajr Sound',
        'settings.fajrSoundLabel': 'Fajr Sound',
        'settings.dhuhrSoundLabel': 'Dhuhr Sound',
        'settings.asrSoundLabel': 'Asr Sound',
        'settings.maghribSoundLabel': 'Maghrib Sound',
        'settings.ishaSoundLabel': 'Isha Sound',
        'settings.athanMakkah': 'Makkah',
        'settings.location': 'Location',
        'settings.useGps': 'Use GPS',
        'settings.manualCity': 'Select City',
        'settings.appearance': 'Appearance',
        'settings.theme': 'Theme',
        'settings.themeDark': 'Dark',
        'settings.language': 'Language',
        'settings.languageEn': 'English',
        'settings.arabicNumerals': 'Arabic-Indic Numerals',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.openSource': 'Open Source (GPL-3.0)',
        'settings.privacy': 'Zero data collected',
        'settings.fajrMakkah': 'Makkah (Fajr)',
        'prayer.fajr': 'Fajr',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        'permission.enableNotifications': 'Enable Notifications',
        'settings.batteryGuide': 'Battery Optimization Guide',
        'settings.prayerAdjustments': 'Prayer Time Adjustments',
        'settings.adjustmentsNone': 'None',
        'settings.elevationRule': 'Elevation Rule',
        'settings.elevationSeaLevel': 'Sea Level',
        'settings.elevationAutomatic': 'Automatic',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock picker components
jest.mock('@/components/settings/CalculationMethodPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    CalculationMethodPicker: () => <RN.Text>MockMethodPicker</RN.Text>,
  }
})

jest.mock('@/components/settings/MadhabPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    MadhabPicker: () => <RN.Text>MockMadhabPicker</RN.Text>,
  }
})

jest.mock('@/components/settings/CityPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    CityPicker: () => <RN.Text>MockCityPicker</RN.Text>,
  }
})

jest.mock('@/components/settings/ThemePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ThemePicker: () => <RN.Text>MockThemePicker</RN.Text>,
  }
})

jest.mock('@/components/settings/LanguagePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    LanguagePicker: () => <RN.Text>MockLanguagePicker</RN.Text>,
  }
})

jest.mock('@/components/settings/AthanSoundPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    AthanSoundPicker: () => <RN.Text>MockAthanSoundPicker</RN.Text>,
  }
})

jest.mock('@/components/settings/OEMBatteryGuide', () => {
  const RN = jest.requireActual('react-native')
  return {
    OEMBatteryGuide: () => <RN.Text>MockOEMBatteryGuide</RN.Text>,
  }
})

jest.mock('@/components/settings/PrayerAdjustmentsPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    PrayerAdjustmentsPicker: () => <RN.Text>MockPrayerAdjustmentsPicker</RN.Text>,
  }
})

jest.mock('@/components/settings/ElevationRulePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ElevationRulePicker: () => <RN.Text>MockElevationRulePicker</RN.Text>,
  }
})

jest.mock('@/components/settings/ReminderOffsetPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ReminderOffsetPicker: () => <RN.Text>MockReminderOffsetPicker</RN.Text>,
  }
})

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}))

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { version: '1.2.3' },
  },
}))

// Mock settings store
const mockSettingsState: Record<string, unknown> = {
  calculationMethod: 'NorthAmerica',
  madhab: 'shafi',
  language: 'en',
  arabicNumerals: false,
  notifications: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  prayerSounds: {
    fajr: 'makkah',
    dhuhr: 'makkah',
    asr: 'makkah',
    maghrib: 'makkah',
    isha: 'makkah',
  },
  prayerAdjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  reminders: {
    fajr: { enabled: false, minutes: 15 },
    dhuhr: { enabled: false, minutes: 15 },
    asr: { enabled: false, minutes: 15 },
    maghrib: { enabled: false, minutes: 15 },
    isha: { enabled: false, minutes: 15 },
  },
  elevationRule: 'seaLevel',
  setNotifications: jest.fn(),
  setArabicNumerals: jest.fn(),
  setReminderEnabled: jest.fn(),
}

jest.mock('@/stores/settings', () => {
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettingsState)
  store.getState = () => mockSettingsState
  return { useSettingsStore: store }
})

// Mock useNotifications hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    permissionGranted: true,
    scheduledCount: 25,
    reschedule: jest.fn(),
  }),
}))

// Mock useLocation hook
jest.mock('@/hooks/useLocation', () => ({
  useLocation: () => ({
    requestLocation: jest.fn(),
  }),
}))

// Mock location store
jest.mock('@/stores/location', () => ({
  useLocationStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      cityName: 'Casablanca',
      source: 'gps',
    }),
}))

const originalPlatformOS = Platform.OS

describe('Settings screen — web platform', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('hides Notifications section when Platform.OS is web', () => {
    render(<SettingsScreen />)

    expect(screen.queryByText('Notifications')).toBeNull()
    expect(screen.queryByText('Fajr')).toBeNull()
    expect(screen.queryByText('Dhuhr')).toBeNull()
    expect(screen.queryByText('Athan Sound')).toBeNull()
    expect(screen.queryByText('Fajr Sound')).toBeNull()
  })

  it('still shows Prayer, Location, Appearance, and About sections on web', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Prayer')).toBeTruthy()
    expect(screen.getByText('Appearance')).toBeTruthy()
    expect(screen.getByText('About')).toBeTruthy()
  })

  it('renders 4 section headers on web (not 5)', () => {
    render(<SettingsScreen />)

    const headers = screen.getAllByRole('header')
    expect(headers).toHaveLength(4)
  })

  it('only has 1 toggle on web (arabic numerals, no prayer toggles)', () => {
    render(<SettingsScreen />)

    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(1) // only arabic numerals
  })
})

describe('Settings screen — native platform shows notifications', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('shows Notifications section when Platform.OS is ios', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Notifications')).toBeTruthy()
    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Fajr Sound')).toBeTruthy()
    expect(screen.getByText('Dhuhr Sound')).toBeTruthy()
  })
})
