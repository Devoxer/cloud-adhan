import { Platform } from 'react-native'

// Mock all heavy dependencies before component imports
jest.mock('@sentry/react-native', () => ({
  reactNavigationIntegration: jest.fn(() => ({
    registerNavigationContainer: jest.fn(),
  })),
  init: jest.fn(),
  wrap: (component: unknown) => component,
}))

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}))

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}))

jest.mock('expo-router', () => {
  const React = jest.requireActual('react')
  const RN = jest.requireActual('react-native')
  return {
    router: { navigate: jest.fn() },
    Stack: Object.assign(
      ({ children }: { children?: React.ReactNode }) =>
        React.createElement(RN.View, null, children),
      { Screen: () => null },
    ),
    useNavigationContainerRef: jest.fn(() => ({ current: null })),
  }
})

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}))

jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native')
  return { GestureHandlerRootView: RN.View }
})

jest.mock('react-native-reanimated', () => 'react-native-reanimated')

jest.mock('@gorhom/bottom-sheet', () => {
  const RN = jest.requireActual('react-native')
  return { BottomSheetModalProvider: RN.View }
})

jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({ resolvedTheme: 'dark' })),
}))

jest.mock('@/theme/provider', () => {
  const RN = jest.requireActual('react-native')
  return { ThemeProvider: RN.View }
})

jest.mock('@react-navigation/native', () => ({
  DarkTheme: {},
  DefaultTheme: {},
  ThemeProvider: ({ children }: { children: unknown }) => children,
}))

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: { language: 'en', resolvedLanguage: 'en', changeLanguage: jest.fn() },
}))

jest.mock('@/services/notification', () => ({
  notificationService: { initialize: jest.fn(), reschedule: jest.fn() },
}))

jest.mock('@/stores/location', () => ({
  useLocationStore: { getState: () => ({ coordinates: null }) },
}))

jest.mock('@/utils/env', () => ({
  env: { EXPO_PUBLIC_SENTRY_DSN: '' },
}))

jest.mock('@/utils/sentry', () => ({
  captureError: jest.fn(),
}))

// Mock settings store — control language per test
let mockLanguage = 'en'
const mockSetLanguage = jest.fn()

jest.mock('@/stores/settings', () => {
  const defaultAdj = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
  const defaultReminders = {
    fajr: { enabled: false, minutes: 15 },
    dhuhr: { enabled: false, minutes: 15 },
    asr: { enabled: false, minutes: 15 },
    maghrib: { enabled: false, minutes: 15 },
    isha: { enabled: false, minutes: 15 },
  }
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      language: mockLanguage,
      setLanguage: mockSetLanguage,
      calculationMethod: 'NorthAmerica',
      madhab: 'shafi',
      notifications: {},
      prayerSounds: { fajr: 'makkah', dhuhr: 'makkah', asr: 'makkah', maghrib: 'makkah', isha: 'makkah' },
      prayerAdjustments: defaultAdj,
      reminders: defaultReminders,
    })
  store.getState = () => ({
    language: mockLanguage,
    calculationMethod: 'NorthAmerica',
    madhab: 'shafi',
    notifications: {},
    prayerSounds: { fajr: 'makkah', dhuhr: 'makkah', asr: 'makkah', maghrib: 'makkah', isha: 'makkah' },
    prayerAdjustments: defaultAdj,
    reminders: defaultReminders,
  })
  return { useSettingsStore: store }
})

// Import after all mocks are set up
import { render } from '@testing-library/react-native'
import RootLayout from '@/app/_layout'

const originalPlatformOS = Platform.OS

describe('app/_layout - renders correctly', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLanguage = 'en'
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('renders without crashing', () => {
    const { toJSON } = render(<RootLayout />)
    expect(toJSON()).toBeTruthy()
  })
})
