import { fireEvent, render, screen } from '@testing-library/react-native'

import { MadhabPicker } from '@/components/settings/MadhabPicker'

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
        'settings.madhab': 'Madhab',
        'settings.madhabHanafi': 'Hanafi',
        'settings.madhabShafi': "Shafi'i",
        'settings.madhabHanafiDesc': "Later Asr time — shadow equals twice an object's length",
        'settings.madhabShafiDesc': "Standard Asr time — shadow equals an object's length",
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
const mockSetMadhab = jest.fn()
const mockSettingsState = {
  madhab: 'shafi',
  setMadhab: mockSetMadhab,
}

jest.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettingsState),
}))

// Mock AccessibilityInfo
const mockAnnounce = jest.fn()
jest.spyOn(
  require('react-native').AccessibilityInfo,
  'announceForAccessibility',
).mockImplementation(mockAnnounce)

describe('components/settings/MadhabPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettingsState.madhab = 'shafi'
  })

  it('renders both Hanafi and Shafi\'i options', () => {
    render(<MadhabPicker />)

    expect(screen.getByText('Hanafi')).toBeTruthy()
    expect(screen.getByText("Shafi'i")).toBeTruthy()
  })

  it('renders descriptions for both options', () => {
    render(<MadhabPicker />)

    expect(screen.getByText("Later Asr time — shadow equals twice an object's length")).toBeTruthy()
    expect(screen.getByText("Standard Asr time — shadow equals an object's length")).toBeTruthy()
  })

  it('renders exactly 2 radio options', () => {
    render(<MadhabPicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('currently selected madhab has checked state', () => {
    render(<MadhabPicker />)

    const shafiRow = screen.getByLabelText("Shafi'i")
    expect(shafiRow.props.accessibilityState).toEqual({ checked: true })

    const hanafiRow = screen.getByLabelText('Hanafi')
    expect(hanafiRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('pressing Hanafi calls setMadhab with hanafi', () => {
    render(<MadhabPicker />)

    fireEvent.press(screen.getByLabelText('Hanafi'))
    expect(mockSetMadhab).toHaveBeenCalledWith('hanafi')
  })

  it('pressing Shafi\'i calls setMadhab with shafi', () => {
    mockSettingsState.madhab = 'hanafi'
    render(<MadhabPicker />)

    fireEvent.press(screen.getByLabelText("Shafi'i"))
    expect(mockSetMadhab).toHaveBeenCalledWith('shafi')
  })

  it('each row has proper accessibility roles and labels', () => {
    render(<MadhabPicker />)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio.props.accessibilityLabel).toBeTruthy()
      expect(radio.props.accessibilityState).toBeDefined()
    }
  })

  it('announces selection for accessibility', () => {
    render(<MadhabPicker />)

    fireEvent.press(screen.getByLabelText('Hanafi'))
    expect(mockAnnounce).toHaveBeenCalledWith('Madhab: Hanafi')
  })

  it('calls onSelect callback after selection', () => {
    const mockOnSelect = jest.fn()
    render(<MadhabPicker onSelect={mockOnSelect} />)

    fireEvent.press(screen.getByLabelText('Hanafi'))
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })
})
