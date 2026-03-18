import { fireEvent, render, screen } from '@testing-library/react-native'

import { ReminderOffsetPicker } from '@/components/settings/ReminderOffsetPicker'
import { Prayer } from '@/types/prayer'

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
      },
      spacing: { xs: 4, sm: 8, md: 16 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        caption: { size: 12, weight: '400', lineHeight: 1.4 },
        label: { size: 14, weight: '600', lineHeight: 1.4 },
      },
      radii: { md: 12 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'settings.reminderMinutesBefore' && params) {
        return `${params.count} min before`
      }
      return key
    },
  })),
}))

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  RN.AccessibilityInfo.announceForAccessibility = jest.fn()
  return RN
})

// Mock settings store
const mockSetReminderMinutes = jest.fn()
let mockCurrentMinutes = 15

jest.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      reminders: {
        fajr: { enabled: true, minutes: mockCurrentMinutes },
        dhuhr: { enabled: false, minutes: 15 },
        asr: { enabled: false, minutes: 15 },
        maghrib: { enabled: false, minutes: 15 },
        isha: { enabled: false, minutes: 15 },
      },
      setReminderMinutes: mockSetReminderMinutes,
    }),
}))

describe('components/settings/ReminderOffsetPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCurrentMinutes = 15
  })

  it('renders 5 offset options (5, 10, 15, 20, 30)', () => {
    render(<ReminderOffsetPicker prayer={Prayer.Fajr} />)

    expect(screen.getByText('5 min before')).toBeTruthy()
    expect(screen.getByText('10 min before')).toBeTruthy()
    expect(screen.getByText('15 min before')).toBeTruthy()
    expect(screen.getByText('20 min before')).toBeTruthy()
    expect(screen.getByText('30 min before')).toBeTruthy()
  })

  it('current offset is marked as selected', () => {
    render(<ReminderOffsetPicker prayer={Prayer.Fajr} />)

    const radios = screen.getAllByRole('radio')
    // 15 min is the 3rd option (index 2), should be checked
    expect(radios[2].props.accessibilityState.checked).toBe(true)
    // Others should not be checked
    expect(radios[0].props.accessibilityState.checked).toBe(false)
    expect(radios[1].props.accessibilityState.checked).toBe(false)
    expect(radios[3].props.accessibilityState.checked).toBe(false)
    expect(radios[4].props.accessibilityState.checked).toBe(false)
  })

  it('selection calls setReminderMinutes and onSelect', () => {
    const mockOnSelect = jest.fn()
    render(<ReminderOffsetPicker prayer={Prayer.Fajr} onSelect={mockOnSelect} />)

    // Press "10 min before"
    fireEvent.press(screen.getByText('10 min before'))

    expect(mockSetReminderMinutes).toHaveBeenCalledWith('fajr', 10)
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })
})
