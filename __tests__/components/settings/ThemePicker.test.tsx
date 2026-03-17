import { fireEvent, render, screen } from '@testing-library/react-native'

import { ThemePicker } from '@/components/settings/ThemePicker'

// Mock useTheme
const mockSetThemePreference = jest.fn()
const mockThemeState = {
  tokens: {
    colors: {
      surface: '#1A1614',
      surfaceElevated: '#2A2420',
      textPrimary: '#F5F0E8',
      textSecondary: '#A89F94',
      textTertiary: '#6B6058',
      accent: '#C4A34D',
      accentSubtle: 'rgba(196, 163, 77, 0.15)',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    typography: {
      body: { size: 16, weight: '400', lineHeight: 1.5 },
      caption: { size: 12, weight: '400', lineHeight: 1.4 },
    },
    radii: { md: 12 },
  },
  themePreference: 'dark' as 'dark' | 'light' | 'system',
  setThemePreference: mockSetThemePreference,
  resolvedTheme: 'dark' as const,
}

jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => mockThemeState),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.theme': 'Theme',
        'settings.themeDark': 'Dark',
        'settings.themeLight': 'Light',
        'settings.themeSystem': 'System',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock AccessibilityInfo
const mockAnnounce = jest.fn()
jest.spyOn(
  require('react-native').AccessibilityInfo,
  'announceForAccessibility',
).mockImplementation(mockAnnounce)

describe('components/settings/ThemePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockThemeState.themePreference = 'dark'
  })

  it('renders all 3 theme options (Dark, Light, System)', () => {
    render(<ThemePicker />)

    expect(screen.getByText('Dark')).toBeTruthy()
    expect(screen.getByText('Light')).toBeTruthy()
    expect(screen.getByText('System')).toBeTruthy()
  })

  it('renders exactly 3 radio options', () => {
    render(<ThemePicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('currently selected theme has checked radio state', () => {
    render(<ThemePicker />)

    const darkRow = screen.getByLabelText('Dark')
    expect(darkRow.props.accessibilityState).toEqual({ checked: true })

    const lightRow = screen.getByLabelText('Light')
    expect(lightRow.props.accessibilityState).toEqual({ checked: false })

    const systemRow = screen.getByLabelText('System')
    expect(systemRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('pressing Light calls setThemePreference with light', () => {
    render(<ThemePicker />)

    fireEvent.press(screen.getByLabelText('Light'))
    expect(mockSetThemePreference).toHaveBeenCalledWith('light')
  })

  it('pressing System calls setThemePreference with system', () => {
    render(<ThemePicker />)

    fireEvent.press(screen.getByLabelText('System'))
    expect(mockSetThemePreference).toHaveBeenCalledWith('system')
  })

  it('pressing Dark calls setThemePreference with dark', () => {
    mockThemeState.themePreference = 'light'
    render(<ThemePicker />)

    fireEvent.press(screen.getByLabelText('Dark'))
    expect(mockSetThemePreference).toHaveBeenCalledWith('dark')
  })

  it('each row has proper accessibility roles and labels', () => {
    render(<ThemePicker />)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio.props.accessibilityLabel).toBeTruthy()
      expect(radio.props.accessibilityState).toBeDefined()
    }
  })

  it('announces selection for accessibility', () => {
    render(<ThemePicker />)

    fireEvent.press(screen.getByLabelText('Light'))
    expect(mockAnnounce).toHaveBeenCalledWith('Theme: Light')
  })

  it('calls onSelect callback after selection', () => {
    const mockOnSelect = jest.fn()
    render(<ThemePicker onSelect={mockOnSelect} />)

    fireEvent.press(screen.getByLabelText('Light'))
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })
})
