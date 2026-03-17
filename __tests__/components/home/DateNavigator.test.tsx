import { render, screen, fireEvent } from '@testing-library/react-native'

import { DateNavigator } from '@/components/home/DateNavigator'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
      },
      spacing: { xs: 4, sm: 8, md: 16 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        label: { size: 14, weight: '500', lineHeight: 1.2 },
      },
      radii: { sm: 8 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'date.previousDay': 'Previous day',
        'date.nextDay': 'Next day',
        'date.goToToday': 'Go to today',
        'date.dateFormat': 'dddd, MMMM D',
        'home.today': 'Today',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
let mockLanguage = 'en'
let mockArabicNumerals = false

jest.mock('@/stores/settings', () => ({
  useSettingsStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      language: mockLanguage,
      arabicNumerals: mockArabicNumerals,
    }),
  ),
}))

// Mock formatNumber
jest.mock('@/utils/format', () => ({
  formatNumber: jest.fn((value: string | number, useArabic: boolean) => {
    if (!useArabic) return String(value)
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    return String(value).replace(/[0-9]/g, (d) => arabicDigits[Number(d)])
  }),
}))

describe('components/home/DateNavigator', () => {
  const testDate = new Date('2026-03-15T12:00:00Z')

  beforeEach(() => {
    jest.clearAllMocks()
    mockLanguage = 'en'
    mockArabicNumerals = false
  })

  it('displays current date formatted correctly', () => {
    render(
      <DateNavigator
        selectedDate={testDate}
        isToday={true}
        onPreviousDay={jest.fn()}
        onNextDay={jest.fn()}
        onGoToToday={jest.fn()}
      />,
    )

    // dayjs formats "Sunday, March 15"
    expect(screen.getByText(/Sunday, March 15/)).toBeTruthy()
  })

  it('next/previous buttons change date', () => {
    const onPreviousDay = jest.fn()
    const onNextDay = jest.fn()

    render(
      <DateNavigator
        selectedDate={testDate}
        isToday={true}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onGoToToday={jest.fn()}
      />,
    )

    fireEvent.press(screen.getByLabelText('Previous day'))
    expect(onPreviousDay).toHaveBeenCalledTimes(1)

    fireEvent.press(screen.getByLabelText('Next day'))
    expect(onNextDay).toHaveBeenCalledTimes(1)
  })

  it('"Today" indicator shown for current date (hidden when isToday)', () => {
    const { rerender } = render(
      <DateNavigator
        selectedDate={testDate}
        isToday={true}
        onPreviousDay={jest.fn()}
        onNextDay={jest.fn()}
        onGoToToday={jest.fn()}
      />,
    )

    // "Today" button should NOT be shown when isToday is true
    expect(screen.queryByText('Today')).toBeNull()

    // When viewing a different date, "Today" button appears
    rerender(
      <DateNavigator
        selectedDate={new Date('2026-03-16T12:00:00Z')}
        isToday={false}
        onPreviousDay={jest.fn()}
        onNextDay={jest.fn()}
        onGoToToday={jest.fn()}
      />,
    )

    expect(screen.getByText('Today')).toBeTruthy()
  })

  it('supports Arabic numerals', () => {
    mockArabicNumerals = true

    render(
      <DateNavigator
        selectedDate={testDate}
        isToday={true}
        onPreviousDay={jest.fn()}
        onNextDay={jest.fn()}
        onGoToToday={jest.fn()}
      />,
    )

    // With Arabic numerals, "15" becomes "١٥"
    expect(screen.getByText(/١٥/)).toBeTruthy()
  })
})
