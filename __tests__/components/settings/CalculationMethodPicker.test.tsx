import { fireEvent, render, screen } from '@testing-library/react-native'

import { CalculationMethodPicker } from '@/components/settings/CalculationMethodPicker'

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
        teal: '#4DB8B0',
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
        'settings.calculationMethod': 'Calculation Method',
        'settings.recommendedForRegion': 'Recommended for your region',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
const mockSetCalculationMethod = jest.fn()
const mockSettingsState = {
  calculationMethod: 'NorthAmerica',
  setCalculationMethod: mockSetCalculationMethod,
}

jest.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettingsState),
}))

// Mock location store
const mockLocationState = {
  coordinates: { latitude: 33.5, longitude: -7.6 },
}

jest.mock('@/stores/location', () => ({
  useLocationStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockLocationState),
}))

// Mock region detection
const mockGetRecommendedMethod = jest.fn((_lat: number, _lng: number) => 'Morocco' as string)
jest.mock('@/utils/region', () => ({
  getRecommendedMethod: (lat: number, lng: number) => mockGetRecommendedMethod(lat, lng),
}))

// Mock AccessibilityInfo
const mockAnnounce = jest.fn()
jest.spyOn(
  require('react-native').AccessibilityInfo,
  'announceForAccessibility',
).mockImplementation(mockAnnounce)

describe('components/settings/CalculationMethodPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettingsState.calculationMethod = 'NorthAmerica'
    mockLocationState.coordinates = { latitude: 33.5, longitude: -7.6 }
    mockGetRecommendedMethod.mockReturnValue('Morocco')
  })

  it('renders all 14 calculation methods', () => {
    render(<CalculationMethodPicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(14)
  })

  it('displays method names and descriptions', () => {
    render(<CalculationMethodPicker />)

    expect(screen.getByText('Islamic Society of North America (ISNA)')).toBeTruthy()
    expect(screen.getByText('Muslim World League')).toBeTruthy()
    expect(screen.getByText('Ministry of Habous, Morocco')).toBeTruthy()
  })

  it('displays regions for each method', () => {
    render(<CalculationMethodPicker />)

    expect(screen.getByText('North America · USA · Canada')).toBeTruthy()
    expect(screen.getByText('Morocco')).toBeTruthy()
    expect(screen.getByText('Europe · Far East · Parts of Americas')).toBeTruthy()
  })

  it('currently selected method has checked state', () => {
    render(<CalculationMethodPicker />)

    const isnaRow = screen.getByLabelText('Islamic Society of North America (ISNA)')
    expect(isnaRow.props.accessibilityState).toEqual({ checked: true })

    const moroccoRow = screen.getByLabelText('Ministry of Habous, Morocco')
    expect(moroccoRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('pressing a method calls setCalculationMethod with correct key', () => {
    render(<CalculationMethodPicker />)

    fireEvent.press(screen.getByLabelText('Ministry of Habous, Morocco'))
    expect(mockSetCalculationMethod).toHaveBeenCalledWith('Morocco')
  })

  it('shows "Recommended for your region" label on auto-detected method', () => {
    render(<CalculationMethodPicker />)

    expect(screen.getByText('Recommended for your region')).toBeTruthy()
  })

  it('does not show recommended label when coordinates are null', () => {
    mockLocationState.coordinates = null as unknown as { latitude: number; longitude: number }
    render(<CalculationMethodPicker />)

    expect(screen.queryByText('Recommended for your region')).toBeNull()
  })

  it('each row has accessibilityRole="radio" and accessibilityLabel', () => {
    render(<CalculationMethodPicker />)

    const radios = screen.getAllByRole('radio')
    for (const radio of radios) {
      expect(radio.props.accessibilityLabel).toBeTruthy()
    }
  })

  it('announces selection for accessibility', () => {
    render(<CalculationMethodPicker />)

    fireEvent.press(screen.getByLabelText('Ministry of Habous, Morocco'))
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Calculation Method: Ministry of Habous, Morocco',
    )
  })

  it('calls onSelect callback after selection', () => {
    const mockOnSelect = jest.fn()
    render(<CalculationMethodPicker onSelect={mockOnSelect} />)

    fireEvent.press(screen.getByLabelText('Muslim World League'))
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

  it('calls getRecommendedMethod with correct coordinates', () => {
    render(<CalculationMethodPicker />)

    expect(mockGetRecommendedMethod).toHaveBeenCalledWith(33.5, -7.6)
  })
})
