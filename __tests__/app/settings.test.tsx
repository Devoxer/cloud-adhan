import { fireEvent, render, screen } from '@testing-library/react-native'
import { Linking, Platform } from 'react-native'

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
        label: { size: 14, weight: '600', lineHeight: 1.4 },
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
        'settings.madhabHanafi': 'Hanafi',
        'settings.madhabShafi': "Shafi'i",
        'settings.notifications': 'Notifications',
        'settings.athanSound': 'Athan Sound',
        'settings.fajrSound': 'Fajr Sound',
        'settings.location': 'Location',
        'settings.useGps': 'Use GPS',
        'settings.manualCity': 'Select City',
        'settings.appearance': 'Appearance',
        'settings.theme': 'Theme',
        'settings.themeDark': 'Dark',
        'settings.themeLight': 'Light',
        'settings.themeSystem': 'System',
        'settings.language': 'Language',
        'settings.languageEn': 'English',
        'settings.languageAr': 'العربية',
        'settings.arabicNumerals': 'Arabic-Indic Numerals',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.openSource': 'Open Source (GPL-3.0)',
        'settings.privacy': 'Zero data collected',
        'settings.athanMakkah': 'Makkah',
        'settings.fajrMakkah': 'Makkah (Fajr)',
        'settings.fajrSoundLabel': 'Fajr Sound',
        'settings.dhuhrSoundLabel': 'Dhuhr Sound',
        'settings.asrSoundLabel': 'Asr Sound',
        'settings.maghribSoundLabel': 'Maghrib Sound',
        'settings.ishaSoundLabel': 'Isha Sound',
        'prayer.fajr': 'Fajr',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        'permission.enableNotifications': 'Enable Notifications',
        'settings.batteryGuide': 'Battery Optimization Guide',
        'settings.prayerAdjustments': 'Prayer Time Adjustments',
        'settings.adjustmentsNone': 'None',
        'settings.adjustmentsCount': '{{count}} adjusted',
        'settings.elevationRule': 'Elevation Rule',
        'settings.elevationSeaLevel': 'Sea Level',
        'settings.elevationAutomatic': 'Automatic',
        'settings.reminder': 'Reminder',
        'settings.reminderOffset': 'Reminder Time',
      }
      if (key === 'settings.reminderMinutesBefore') {
        return '15 min before'
      }
      if (key === 'settings.adjustmentsCount') {
        return translations[key] ?? key
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock picker components
jest.mock('@/components/settings/CalculationMethodPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    CalculationMethodPicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="calculation-method-picker">
        <RN.Pressable testID="mock-method-select" onPress={onSelect}>
          <RN.Text>MockMethodPicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/MadhabPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    MadhabPicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="madhab-picker">
        <RN.Pressable testID="mock-madhab-select" onPress={onSelect}>
          <RN.Text>MockMadhabPicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/CityPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    CityPicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="city-picker">
        <RN.Pressable testID="mock-city-select" onPress={onSelect}>
          <RN.Text>MockCityPicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/ThemePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ThemePicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="theme-picker">
        <RN.Pressable testID="mock-theme-select" onPress={onSelect}>
          <RN.Text>MockThemePicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/LanguagePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    LanguagePicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="language-picker">
        <RN.Pressable testID="mock-language-select" onPress={onSelect}>
          <RN.Text>MockLanguagePicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/AthanSoundPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    AthanSoundPicker: ({ prayer, onSelect }: { prayer?: string; onSelect?: () => void }) => (
      <RN.View testID="athan-sound-picker">
        <RN.Text testID="sound-picker-prayer">{prayer}</RN.Text>
        <RN.Pressable testID="mock-athan-select" onPress={onSelect}>
          <RN.Text>MockAthanSoundPicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/OEMBatteryGuide', () => {
  const RN = jest.requireActual('react-native')
  return {
    OEMBatteryGuide: () => (
      <RN.View testID="oem-battery-guide">
        <RN.Text>MockOEMBatteryGuide</RN.Text>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/PrayerAdjustmentsPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    PrayerAdjustmentsPicker: () => (
      <RN.View testID="prayer-adjustments-picker">
        <RN.Text>MockPrayerAdjustmentsPicker</RN.Text>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/ElevationRulePicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ElevationRulePicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="elevation-rule-picker">
        <RN.Pressable testID="mock-elevation-select" onPress={onSelect}>
          <RN.Text>MockElevationRulePicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

jest.mock('@/components/settings/ReminderOffsetPicker', () => {
  const RN = jest.requireActual('react-native')
  return {
    ReminderOffsetPicker: ({ prayer, onSelect }: { prayer?: string; onSelect?: () => void }) => (
      <RN.View testID="reminder-offset-picker">
        <RN.Text testID="reminder-picker-prayer">{prayer}</RN.Text>
        <RN.Pressable testID="mock-reminder-offset-select" onPress={onSelect}>
          <RN.Text>MockReminderOffsetPicker</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),
  }
})

// Mock expo-haptics (used by Toggle)
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
const mockSetNotifications = jest.fn()
const mockSetArabicNumerals = jest.fn()
const mockSetReminderEnabled = jest.fn()
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
  setNotifications: mockSetNotifications,
  setArabicNumerals: mockSetArabicNumerals,
  setReminderEnabled: mockSetReminderEnabled,
}

jest.mock('@/stores/settings', () => {
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettingsState)
  store.getState = () => mockSettingsState
  return { useSettingsStore: store }
})

// Mock useNotifications hook
let mockPermissionGranted = true
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    permissionGranted: mockPermissionGranted,
    scheduledCount: 25,
    reschedule: jest.fn(),
  }),
}))

// Mock useLocation hook
const mockRequestLocation = jest.fn()
jest.mock('@/hooks/useLocation', () => ({
  useLocation: () => ({
    requestLocation: mockRequestLocation,
  }),
}))

// Mock location store
const mockLocationState: { cityName: string | null; source: string } = {
  cityName: 'Casablanca',
  source: 'gps',
}

jest.mock('@/stores/location', () => ({
  useLocationStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockLocationState),
}))

const originalPlatformOS = Platform.OS

describe('app/(tabs)/settings - SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettingsState.notifications = {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    }
    mockSettingsState.language = 'en'
    mockSettingsState.arabicNumerals = false
    mockSettingsState.reminders = {
      fajr: { enabled: false, minutes: 15 },
      dhuhr: { enabled: false, minutes: 15 },
      asr: { enabled: false, minutes: 15 },
      maghrib: { enabled: false, minutes: 15 },
      isha: { enabled: false, minutes: 15 },
    }
    mockPermissionGranted = true
    mockLocationState.source = 'gps'
    mockLocationState.cityName = 'Casablanca'
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('renders all 5 section headers', () => {
    render(<SettingsScreen />)

    const headers = screen.getAllByRole('header')
    expect(headers).toHaveLength(5)
    expect(screen.getByText('Prayer')).toBeTruthy()
    expect(screen.getByText('Notifications')).toBeTruthy()
    expect(screen.getAllByText('Location').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Appearance')).toBeTruthy()
    expect(screen.getByText('About')).toBeTruthy()
  })

  it('shows calculation method and madhab in prayer section', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Calculation Method')).toBeTruthy()
    expect(screen.getByText('Islamic Society of North America (ISNA)')).toBeTruthy()
    expect(screen.getByText('Madhab')).toBeTruthy()
    expect(screen.getByText("Shafi'i")).toBeTruthy()
  })

  it('shows 5 prayer notification toggles plus 5 reminder toggles', () => {
    render(<SettingsScreen />)

    const switches = screen.getAllByRole('switch')
    // 5 prayer toggles + 5 reminder toggles + 1 arabic numerals toggle = 11
    expect(switches).toHaveLength(11)

    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('Asr')).toBeTruthy()
    expect(screen.getByText('Maghrib')).toBeTruthy()
    expect(screen.getByText('Isha')).toBeTruthy()
  })

  it('shows 5 per-prayer sound rows with current sound names', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Fajr Sound')).toBeTruthy()
    expect(screen.getByText('Dhuhr Sound')).toBeTruthy()
    expect(screen.getByText('Asr Sound')).toBeTruthy()
    expect(screen.getByText('Maghrib Sound')).toBeTruthy()
    expect(screen.getByText('Isha Sound')).toBeTruthy()
  })

  it('shows location info with GPS source', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Use GPS: Casablanca')).toBeTruthy()
  })

  it('shows appearance section with theme, language, and arabic numerals toggle', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Theme')).toBeTruthy()
    expect(screen.getByText('Dark')).toBeTruthy()
    expect(screen.getByText('Language')).toBeTruthy()
    expect(screen.getByText('English')).toBeTruthy()
    expect(screen.getByText('Arabic-Indic Numerals')).toBeTruthy()
  })

  it('shows about section with version, open source, and privacy', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Version')).toBeTruthy()
    expect(screen.getByText('1.2.3')).toBeTruthy()
    expect(screen.getByText('Open Source (GPL-3.0)')).toBeTruthy()
    expect(screen.getByText('Zero data collected')).toBeTruthy()
  })

  it('toggles prayer notification and calls setNotifications', () => {
    render(<SettingsScreen />)

    // Find the Fajr toggle switch and press it
    const switches = screen.getAllByRole('switch')
    // First switch is Fajr
    fireEvent.press(switches[0])

    expect(mockSetNotifications).toHaveBeenCalledWith({
      fajr: false,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    })
  })

  it('does not show "Use GPS" navigation row when source is gps', () => {
    mockLocationState.source = 'gps'
    render(<SettingsScreen />)

    // The location value row shows "Use GPS: Casablanca" but the separate "Use GPS" navigation row should not exist
    expect(screen.queryByLabelText('Use GPS')).toBeNull()
  })

  it('shows "Use GPS" navigation row when source is manual', () => {
    mockLocationState.source = 'manual'
    render(<SettingsScreen />)

    expect(screen.getByLabelText('Use GPS')).toBeTruthy()
  })

  it('shows "Select City: CityName" when location source is manual', () => {
    mockLocationState.source = 'manual'
    mockLocationState.cityName = 'Cairo'
    render(<SettingsScreen />)

    expect(screen.getByText('Select City: Cairo')).toBeTruthy()
  })

  it('opens GitHub URL when Open Source row is pressed', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    render(<SettingsScreen />)

    fireEvent.press(screen.getByLabelText('Open Source (GPL-3.0)'))

    expect(openURLSpy).toHaveBeenCalledWith('https://github.com/cloud-athan/cloud-athan')
    openURLSpy.mockRestore()
  })

  it('toggles arabic numerals and calls setArabicNumerals', () => {
    render(<SettingsScreen />)

    const arabicNumeralsToggle = screen.getByLabelText('Arabic-Indic Numerals')
    fireEvent.press(arabicNumeralsToggle)

    expect(mockSetArabicNumerals).toHaveBeenCalledWith(true)
  })

  it('shows fallback location when cityName is null', () => {
    mockLocationState.cityName = null
    render(<SettingsScreen />)

    // Location value row should show fallback "Location" text as value
    expect(screen.getByLabelText('Location, Location')).toBeTruthy()
  })

  it('does not show pickers initially', () => {
    render(<SettingsScreen />)

    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()
    expect(screen.queryByTestId('madhab-picker')).toBeNull()
    expect(screen.queryByTestId('city-picker')).toBeNull()
    expect(screen.queryByTestId('theme-picker')).toBeNull()
    expect(screen.queryByTestId('language-picker')).toBeNull()
  })

  it('pressing Calculation Method row opens method picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()

    // Press to open bottom sheet
    fireEvent.press(
      screen.getByLabelText('Calculation Method, Islamic Society of North America (ISNA)'),
    )
    expect(screen.getByTestId('calculation-method-picker')).toBeTruthy()
  })

  it('pressing Madhab row opens madhab picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('madhab-picker')).toBeNull()

    // Press to open bottom sheet
    fireEvent.press(screen.getByLabelText("Madhab, Shafi'i"))
    expect(screen.getByTestId('madhab-picker')).toBeTruthy()
  })

  it('selecting a method dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(
      screen.getByLabelText('Calculation Method, Islamic Society of North America (ISNA)'),
    )
    expect(screen.getByTestId('calculation-method-picker')).toBeTruthy()

    // Select a method (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-method-select'))
    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()
  })

  it('selecting a madhab dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(screen.getByLabelText("Madhab, Shafi'i"))
    expect(screen.getByTestId('madhab-picker')).toBeTruthy()

    // Select a madhab (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-madhab-select'))
    expect(screen.queryByTestId('madhab-picker')).toBeNull()
  })

  it('pressing Select City row opens city picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('city-picker')).toBeNull()

    // Press to open bottom sheet
    fireEvent.press(screen.getByLabelText('Select City'))
    expect(screen.getByTestId('city-picker')).toBeTruthy()
  })

  it('selecting a city dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(screen.getByLabelText('Select City'))
    expect(screen.getByTestId('city-picker')).toBeTruthy()

    // Select a city (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-city-select'))
    expect(screen.queryByTestId('city-picker')).toBeNull()
  })

  it('pressing Use GPS row calls requestLocation when source is manual', () => {
    mockLocationState.source = 'manual'
    render(<SettingsScreen />)

    fireEvent.press(screen.getByLabelText('Use GPS'))

    expect(mockRequestLocation).toHaveBeenCalledTimes(1)
  })

  it('pressing Theme row opens theme picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('theme-picker')).toBeNull()

    // Press to open bottom sheet
    fireEvent.press(screen.getByLabelText('Theme, Dark'))
    expect(screen.getByTestId('theme-picker')).toBeTruthy()
  })

  it('selecting a theme dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(screen.getByLabelText('Theme, Dark'))
    expect(screen.getByTestId('theme-picker')).toBeTruthy()

    // Select a theme (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-theme-select'))
    expect(screen.queryByTestId('theme-picker')).toBeNull()
  })

  it('pressing Language row opens language picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('language-picker')).toBeNull()

    // Press to open bottom sheet
    fireEvent.press(screen.getByLabelText('Language, English'))
    expect(screen.getByTestId('language-picker')).toBeTruthy()
  })

  it('selecting a language dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(screen.getByLabelText('Language, English'))
    expect(screen.getByTestId('language-picker')).toBeTruthy()

    // Select a language (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-language-select'))
    expect(screen.queryByTestId('language-picker')).toBeNull()
  })

  it('pressing a prayer sound row opens sound picker in bottom sheet', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()

    // Press Fajr Sound row to open bottom sheet
    fireEvent.press(screen.getByLabelText('Fajr Sound, Makkah'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()
    expect(screen.getByTestId('sound-picker-prayer').props.children).toBe('fajr')
  })

  it('pressing Dhuhr sound row passes dhuhr prayer to picker', () => {
    render(<SettingsScreen />)

    fireEvent.press(screen.getByLabelText('Dhuhr Sound, Makkah'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()
    expect(screen.getByTestId('sound-picker-prayer').props.children).toBe('dhuhr')
  })

  it('selecting a sound dismisses the bottom sheet', () => {
    render(<SettingsScreen />)

    // Open picker
    fireEvent.press(screen.getByLabelText('Fajr Sound, Makkah'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()

    // Select a sound (triggers onSelect → dismiss → onDismiss → activeSheet=null)
    fireEvent.press(screen.getByTestId('mock-athan-select'))
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()
  })

  it('shows Enable Notifications row when permission is denied', () => {
    mockPermissionGranted = false
    render(<SettingsScreen />)

    expect(screen.getByLabelText('Enable Notifications')).toBeTruthy()
  })

  it('does NOT show Enable Notifications row when permission is granted', () => {
    mockPermissionGranted = true
    render(<SettingsScreen />)

    expect(screen.queryByLabelText('Enable Notifications')).toBeNull()
  })

  it('pressing Enable Notifications opens system settings', () => {
    mockPermissionGranted = false
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined)
    render(<SettingsScreen />)

    fireEvent.press(screen.getByLabelText('Enable Notifications'))

    expect(openSettingsSpy).toHaveBeenCalled()
    openSettingsSpy.mockRestore()
  })

  it('does NOT show battery guide row on iOS', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
    render(<SettingsScreen />)

    expect(screen.queryByLabelText('Battery Optimization Guide')).toBeNull()
  })

  it('shows battery guide row on Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    render(<SettingsScreen />)

    expect(screen.getByLabelText('Battery Optimization Guide')).toBeTruthy()
  })

  it('pressing battery guide row opens OEMBatteryGuide in bottom sheet on Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('oem-battery-guide')).toBeNull()

    // Press battery guide row to open bottom sheet
    fireEvent.press(screen.getByLabelText('Battery Optimization Guide'))
    expect(screen.getByTestId('oem-battery-guide')).toBeTruthy()
  })

  it('does not show pickers initially including athan sound picker', () => {
    render(<SettingsScreen />)

    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()
  })

  it('shows Prayer Time Adjustments row with "None" when all zero', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Prayer Time Adjustments')).toBeTruthy()
    expect(screen.getByLabelText('Prayer Time Adjustments, None')).toBeTruthy()
  })

  it('shows Elevation Rule row with "Sea Level" as default', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Elevation Rule')).toBeTruthy()
    expect(screen.getByLabelText('Elevation Rule, Sea Level')).toBeTruthy()
  })

  it('pressing Prayer Time Adjustments row opens adjustments picker', () => {
    render(<SettingsScreen />)

    expect(screen.queryByTestId('prayer-adjustments-picker')).toBeNull()

    fireEvent.press(screen.getByLabelText('Prayer Time Adjustments, None'))
    expect(screen.getByTestId('prayer-adjustments-picker')).toBeTruthy()
  })

  it('pressing Elevation Rule row opens elevation picker', () => {
    render(<SettingsScreen />)

    expect(screen.queryByTestId('elevation-rule-picker')).toBeNull()

    fireEvent.press(screen.getByLabelText('Elevation Rule, Sea Level'))
    expect(screen.getByTestId('elevation-rule-picker')).toBeTruthy()
  })

  it('shows reminder toggle rows when prayer is enabled', () => {
    render(<SettingsScreen />)

    // All 5 prayers are enabled, so 5 reminder toggles should be visible
    const reminderLabels = screen.getAllByLabelText(/^Reminder/)
    expect(reminderLabels.length).toBe(5)
  })

  it('hides reminder rows when prayer notification is disabled', () => {
    mockSettingsState.notifications = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    }
    render(<SettingsScreen />)

    // No reminder toggles should be visible when all prayers disabled
    expect(screen.queryByText('Reminder')).toBeNull()
  })

  it('shows reminder offset row when reminder is enabled', () => {
    mockSettingsState.reminders = {
      fajr: { enabled: true, minutes: 15 },
      dhuhr: { enabled: false, minutes: 15 },
      asr: { enabled: false, minutes: 15 },
      maghrib: { enabled: false, minutes: 15 },
      isha: { enabled: false, minutes: 15 },
    }
    render(<SettingsScreen />)

    expect(screen.getByText('Reminder Time')).toBeTruthy()
    expect(screen.getByText('15 min before')).toBeTruthy()
  })
})
