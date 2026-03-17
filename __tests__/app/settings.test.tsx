import { fireEvent, render, screen } from '@testing-library/react-native'
import { I18nManager, Linking, Platform } from 'react-native'

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
        'common.restartRequired': 'App restart required to apply changes',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.openSource': 'Open Source (GPL-3.0)',
        'settings.privacy': 'Zero data collected',
        'settings.athanMakkah': 'Makkah',
        'settings.fajrMakkah': 'Makkah (Fajr)',
        'prayer.fajr': 'Fajr',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        'permission.enableNotifications': 'Enable Notifications',
        'settings.batteryGuide': 'Battery Optimization Guide',
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
    AthanSoundPicker: ({ onSelect }: { onSelect?: () => void }) => (
      <RN.View testID="athan-sound-picker">
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
const mockSettingsState = {
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
  athanSound: 'makkah',
  fajrSound: 'fajr-makkah',
  setNotifications: mockSetNotifications,
  setArabicNumerals: mockSetArabicNumerals,
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
    mockPermissionGranted = true
    mockLocationState.source = 'gps'
    mockLocationState.cityName = 'Casablanca'
    Object.defineProperty(I18nManager, 'isRTL', { value: false, configurable: true })
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

  it('shows 5 prayer notification toggles', () => {
    render(<SettingsScreen />)

    const switches = screen.getAllByRole('switch')
    // 5 prayer toggles + 1 arabic numerals toggle = 6
    expect(switches).toHaveLength(6)

    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('Asr')).toBeTruthy()
    expect(screen.getByText('Maghrib')).toBeTruthy()
    expect(screen.getByText('Isha')).toBeTruthy()
  })

  it('shows athan and fajr sound names', () => {
    render(<SettingsScreen />)

    expect(screen.getByText('Athan Sound')).toBeTruthy()
    expect(screen.getByText('Makkah')).toBeTruthy()
    expect(screen.getByText('Fajr Sound')).toBeTruthy()
    expect(screen.getByText('Makkah (Fajr)')).toBeTruthy()
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

    const switches = screen.getAllByRole('switch')
    // Last switch is arabic numerals (after 5 prayer toggles)
    fireEvent.press(switches[5])

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

  it('pressing Calculation Method row toggles method picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()

    // Press to expand
    fireEvent.press(
      screen.getByLabelText('Calculation Method, Islamic Society of North America (ISNA)'),
    )
    expect(screen.getByTestId('calculation-method-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(
      screen.getByLabelText('Calculation Method, Islamic Society of North America (ISNA)'),
    )
    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()
  })

  it('pressing Madhab row toggles madhab picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('madhab-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText("Madhab, Shafi'i"))
    expect(screen.getByTestId('madhab-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText("Madhab, Shafi'i"))
    expect(screen.queryByTestId('madhab-picker')).toBeNull()
  })

  it('selecting a method collapses the method picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(
      screen.getByLabelText('Calculation Method, Islamic Society of North America (ISNA)'),
    )
    expect(screen.getByTestId('calculation-method-picker')).toBeTruthy()

    // Select a method (triggers onSelect callback)
    fireEvent.press(screen.getByTestId('mock-method-select'))
    expect(screen.queryByTestId('calculation-method-picker')).toBeNull()
  })

  it('selecting a madhab collapses the madhab picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(screen.getByLabelText("Madhab, Shafi'i"))
    expect(screen.getByTestId('madhab-picker')).toBeTruthy()

    // Select a madhab (triggers onSelect callback)
    fireEvent.press(screen.getByTestId('mock-madhab-select'))
    expect(screen.queryByTestId('madhab-picker')).toBeNull()
  })

  it('pressing Select City row toggles city picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('city-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText('Select City'))
    expect(screen.getByTestId('city-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Select City'))
    expect(screen.queryByTestId('city-picker')).toBeNull()
  })

  it('selecting a city collapses the city picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(screen.getByLabelText('Select City'))
    expect(screen.getByTestId('city-picker')).toBeTruthy()

    // Select a city (triggers onSelect callback)
    fireEvent.press(screen.getByTestId('mock-city-select'))
    expect(screen.queryByTestId('city-picker')).toBeNull()
  })

  it('pressing Use GPS row calls requestLocation when source is manual', () => {
    mockLocationState.source = 'manual'
    render(<SettingsScreen />)

    fireEvent.press(screen.getByLabelText('Use GPS'))

    expect(mockRequestLocation).toHaveBeenCalledTimes(1)
  })

  it('pressing Theme row toggles theme picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('theme-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText('Theme, Dark'))
    expect(screen.getByTestId('theme-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Theme, Dark'))
    expect(screen.queryByTestId('theme-picker')).toBeNull()
  })

  it('selecting a theme collapses the theme picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(screen.getByLabelText('Theme, Dark'))
    expect(screen.getByTestId('theme-picker')).toBeTruthy()

    // Select a theme (triggers onSelect callback)
    fireEvent.press(screen.getByTestId('mock-theme-select'))
    expect(screen.queryByTestId('theme-picker')).toBeNull()
  })

  it('pressing Language row toggles language picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('language-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText('Language, English'))
    expect(screen.getByTestId('language-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Language, English'))
    expect(screen.queryByTestId('language-picker')).toBeNull()
  })

  it('selecting a language collapses the language picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(screen.getByLabelText('Language, English'))
    expect(screen.getByTestId('language-picker')).toBeTruthy()

    // Select a language (triggers onSelect callback)
    fireEvent.press(screen.getByTestId('mock-language-select'))
    expect(screen.queryByTestId('language-picker')).toBeNull()
  })

  it('shows restart notice when language RTL direction mismatches current layout', () => {
    mockSettingsState.language = 'ar'
    Object.defineProperty(I18nManager, 'isRTL', { value: false, configurable: true })

    render(<SettingsScreen />)

    expect(screen.getByText('App restart required to apply changes')).toBeTruthy()
  })

  it('does NOT show restart notice when language matches RTL direction', () => {
    mockSettingsState.language = 'en'
    Object.defineProperty(I18nManager, 'isRTL', { value: false, configurable: true })

    render(<SettingsScreen />)

    expect(screen.queryByText('App restart required to apply changes')).toBeNull()
  })

  it('does NOT show restart notice when Arabic and RTL already active', () => {
    mockSettingsState.language = 'ar'
    Object.defineProperty(I18nManager, 'isRTL', { value: true, configurable: true })

    render(<SettingsScreen />)

    expect(screen.queryByText('App restart required to apply changes')).toBeNull()
  })

  it('pressing Athan Sound row toggles athan sound picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText('Athan Sound, Makkah'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Athan Sound, Makkah'))
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()
  })

  it('pressing Fajr Sound row toggles athan sound picker visibility', () => {
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()

    // Press to expand
    fireEvent.press(screen.getByLabelText('Fajr Sound, Makkah (Fajr)'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Fajr Sound, Makkah (Fajr)'))
    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()
  })

  it('selecting a sound collapses the athan sound picker', () => {
    render(<SettingsScreen />)

    // Expand picker
    fireEvent.press(screen.getByLabelText('Athan Sound, Makkah'))
    expect(screen.getByTestId('athan-sound-picker')).toBeTruthy()

    // Select a sound (triggers onSelect callback)
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

  it('pressing battery guide row toggles OEMBatteryGuide visibility on Android', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    render(<SettingsScreen />)

    // Initially hidden
    expect(screen.queryByTestId('oem-battery-guide')).toBeNull()

    // Press battery guide row to expand
    fireEvent.press(screen.getByLabelText('Battery Optimization Guide'))
    expect(screen.getByTestId('oem-battery-guide')).toBeTruthy()

    // Press again to collapse
    fireEvent.press(screen.getByLabelText('Battery Optimization Guide'))
    expect(screen.queryByTestId('oem-battery-guide')).toBeNull()
  })

  it('does not show pickers initially including athan sound picker', () => {
    render(<SettingsScreen />)

    expect(screen.queryByTestId('athan-sound-picker')).toBeNull()
  })
})
