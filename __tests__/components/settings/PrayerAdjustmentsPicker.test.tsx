import { fireEvent, render, screen } from '@testing-library/react-native'

import { PrayerAdjustmentsPicker } from '@/components/settings/PrayerAdjustmentsPicker'

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}))

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        onAccent: '#FFFFFF',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        label: { size: 14, weight: '600', lineHeight: 1.4 },
      },
      radii: { sm: 8, md: 12 },
    },
  })),
}))

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'prayer.fajr': 'Fajr',
        'prayer.sunrise': 'Sunrise',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        'settings.resetAdjustments': 'Reset All',
        'settings.decreaseAdjustment': 'Decrease adjustment',
        'settings.increaseAdjustment': 'Increase adjustment',
      }
      if (key === 'settings.minuteFormat' && params) return `${params.value} min`
      if (key === 'settings.minuteFormatPositive' && params) return `+${params.value} min`
      return map[key] ?? key
    },
  }),
}))

// Mock settings store
const mockSetPrayerAdjustment = jest.fn()
const mockResetPrayerAdjustments = jest.fn()
let mockAdjustments = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
}

jest.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      prayerAdjustments: mockAdjustments,
      setPrayerAdjustment: mockSetPrayerAdjustment,
      resetPrayerAdjustments: mockResetPrayerAdjustments,
    }),
}))

describe('PrayerAdjustmentsPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAdjustments = {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    }
  })

  it('renders 6 prayer rows', () => {
    render(<PrayerAdjustmentsPicker />)

    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Sunrise')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('Asr')).toBeTruthy()
    expect(screen.getByText('Maghrib')).toBeTruthy()
    expect(screen.getByText('Isha')).toBeTruthy()
  })

  it('renders Reset All button', () => {
    render(<PrayerAdjustmentsPicker />)

    expect(screen.getByText('Reset All')).toBeTruthy()
  })

  it('pressing + button calls setPrayerAdjustment with incremented value', () => {
    render(<PrayerAdjustmentsPicker />)

    // Find increase buttons (accessibilityRole="button")
    const increaseButtons = screen.getAllByLabelText(/Increase adjustment/)
    fireEvent.press(increaseButtons[0]) // Fajr increase

    expect(mockSetPrayerAdjustment).toHaveBeenCalledWith('fajr', 1)
  })

  it('pressing - button calls setPrayerAdjustment with decremented value', () => {
    render(<PrayerAdjustmentsPicker />)

    const decreaseButtons = screen.getAllByLabelText(/Decrease adjustment/)
    fireEvent.press(decreaseButtons[0]) // Fajr decrease

    expect(mockSetPrayerAdjustment).toHaveBeenCalledWith('fajr', -1)
  })

  it('Reset All button calls resetPrayerAdjustments', () => {
    mockAdjustments = { ...mockAdjustments, fajr: 5 }
    render(<PrayerAdjustmentsPicker />)

    fireEvent.press(screen.getByText('Reset All'))

    expect(mockResetPrayerAdjustments).toHaveBeenCalledTimes(1)
  })

  it('displays correct format for zero, positive, and negative values', () => {
    mockAdjustments = { fajr: 5, sunrise: 0, dhuhr: -3, asr: 0, maghrib: 0, isha: 0 }
    render(<PrayerAdjustmentsPicker />)

    expect(screen.getByText('+5 min')).toBeTruthy()
    expect(screen.getByText('-3 min')).toBeTruthy()
    expect(screen.getAllByText('0 min').length).toBeGreaterThanOrEqual(1)
  })

  it('does not call setPrayerAdjustment when + pressed at max limit', () => {
    mockAdjustments = { fajr: 30, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
    render(<PrayerAdjustmentsPicker />)

    const increaseButtons = screen.getAllByLabelText(/Increase adjustment/)
    fireEvent.press(increaseButtons[0]) // Fajr increase (already at 30)

    expect(mockSetPrayerAdjustment).not.toHaveBeenCalled()
  })

  it('does not call setPrayerAdjustment when - pressed at min limit', () => {
    mockAdjustments = { fajr: -30, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
    render(<PrayerAdjustmentsPicker />)

    const decreaseButtons = screen.getAllByLabelText(/Decrease adjustment/)
    fireEvent.press(decreaseButtons[0]) // Fajr decrease (already at -30)

    expect(mockSetPrayerAdjustment).not.toHaveBeenCalled()
  })
})
