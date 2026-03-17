import { fireEvent, render, screen } from '@testing-library/react-native'

import { LanguagePicker } from '@/components/settings/LanguagePicker'

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6058',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        warning: '#E8A838',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        caption: { size: 12, weight: '400', lineHeight: 1.4 },
      },
      radii: { md: 12 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.language': 'Language',
        'settings.languageEn': 'English',
        'settings.languageAr': 'العربية',
        'common.restartRequired': 'App restart required to apply changes',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
const mockSetLanguage = jest.fn()
const mockSettingsState = {
  language: 'en',
  setLanguage: mockSetLanguage,
}

jest.mock('@/stores/settings', () => {
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettingsState)
  store.getState = () => mockSettingsState
  return { useSettingsStore: store }
})

// Mock AccessibilityInfo
const mockAnnounce = jest.fn()
jest.spyOn(
  require('react-native').AccessibilityInfo,
  'announceForAccessibility',
).mockImplementation(mockAnnounce)

describe('components/settings/LanguagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettingsState.language = 'en'
  })

  it('renders 2 language options (English, Arabic)', () => {
    render(<LanguagePicker />)

    expect(screen.getByText('English')).toBeTruthy()
    expect(screen.getByText('العربية')).toBeTruthy()
  })

  it('renders exactly 2 radio options', () => {
    render(<LanguagePicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('currently selected language has checked radio state', () => {
    render(<LanguagePicker />)

    const enRow = screen.getByLabelText('English')
    expect(enRow.props.accessibilityState).toEqual({ checked: true })

    const arRow = screen.getByLabelText('العربية')
    expect(arRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('pressing Arabic calls setLanguage with ar', () => {
    render(<LanguagePicker />)

    fireEvent.press(screen.getByLabelText('العربية'))
    expect(mockSetLanguage).toHaveBeenCalledWith('ar')
  })

  it('pressing English calls setLanguage with en', () => {
    mockSettingsState.language = 'ar'
    render(<LanguagePicker />)

    fireEvent.press(screen.getByLabelText('English'))
    expect(mockSetLanguage).toHaveBeenCalledWith('en')
  })

  it('each row has proper accessibility roles and labels', () => {
    render(<LanguagePicker />)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio.props.accessibilityLabel).toBeTruthy()
      expect(radio.props.accessibilityState).toBeDefined()
    }
  })

  it('announces selection for accessibility', () => {
    render(<LanguagePicker />)

    fireEvent.press(screen.getByLabelText('العربية'))
    expect(mockAnnounce).toHaveBeenCalledWith('Language: العربية')
  })

  it('calls onSelect callback after selection', () => {
    const mockOnSelect = jest.fn()
    render(<LanguagePicker onSelect={mockOnSelect} />)

    fireEvent.press(screen.getByLabelText('العربية'))
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

})
