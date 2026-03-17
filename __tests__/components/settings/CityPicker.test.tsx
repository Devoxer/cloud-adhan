import { fireEvent, render, screen } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'

import { CityPicker } from '@/components/settings/CityPicker'

// Mock FlashList (renders like FlatList in tests)
jest.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native')
  return { FlashList: FlatList }
})

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
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'settings.searchCities': 'Search cities...',
        'settings.citySelected': `${params?.city ?? ''} selected`,
        'settings.noCitiesFound': 'No cities found',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock location store
const mockSetLocation = jest.fn()
const mockLocationState: {
  coordinates: { latitude: number; longitude: number } | null
} = {
  coordinates: null,
}

jest.mock('@/stores/location', () => {
  const store = (selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockLocationState)
  store.getState = () => ({
    ...mockLocationState,
    setLocation: mockSetLocation,
  })
  return { useLocationStore: store }
})

// Mock cities with a small subset for testing
jest.mock('@/constants/cities', () => ({
  CITIES: [
    { key: 'cairo-eg', name: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357 },
    { key: 'casablanca-ma', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', latitude: 33.5731, longitude: -7.5898 },
    { key: 'dubai-ae', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708 },
    { key: 'istanbul-tr', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', latitude: 41.0082, longitude: 28.9784 },
    { key: 'london-gb', name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  ],
}))

// Spy on AccessibilityInfo
const announceForAccessibilitySpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')

describe('components/settings/CityPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocationState.coordinates = null
  })

  it('renders initial list of cities', () => {
    render(<CityPicker />)

    expect(screen.getByText('Cairo')).toBeTruthy()
    expect(screen.getByText('Casablanca')).toBeTruthy()
    expect(screen.getByText('Dubai')).toBeTruthy()
    expect(screen.getByText('Istanbul')).toBeTruthy()
    expect(screen.getByText('London')).toBeTruthy()
  })

  it('renders search input with placeholder', () => {
    render(<CityPicker />)

    expect(screen.getByPlaceholderText('Search cities...')).toBeTruthy()
  })

  it('filters cities by search query', () => {
    render(<CityPicker />)

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), 'cai')

    expect(screen.getByText('Cairo')).toBeTruthy()
    expect(screen.queryByText('Dubai')).toBeNull()
    expect(screen.queryByText('London')).toBeNull()
  })

  it('search is case-insensitive', () => {
    render(<CityPicker />)

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), 'CAIRO')

    expect(screen.getByText('Cairo')).toBeTruthy()
  })

  it('empty search shows all cities', () => {
    render(<CityPicker />)

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), 'cai')
    expect(screen.queryByText('Dubai')).toBeNull()

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), '')
    expect(screen.getByText('Dubai')).toBeTruthy()
    expect(screen.getByText('Cairo')).toBeTruthy()
  })

  it('search with no matches shows empty state message', () => {
    render(<CityPicker />)

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), 'zzzzz')

    expect(screen.queryByText('Cairo')).toBeNull()
    expect(screen.queryByText('Dubai')).toBeNull()
    expect(screen.getByText('No cities found')).toBeTruthy()
  })

  it('pressing a city calls setLocation with correct data', () => {
    render(<CityPicker />)

    fireEvent.press(screen.getByLabelText('Cairo, Egypt'))

    expect(mockSetLocation).toHaveBeenCalledWith(
      { latitude: 30.0444, longitude: 31.2357 },
      'Cairo',
      'manual',
    )
  })

  it('currently selected city has checked radio state', () => {
    mockLocationState.coordinates = { latitude: 30.0444, longitude: 31.2357 }
    render(<CityPicker />)

    const cairoRow = screen.getByLabelText('Cairo, Egypt')
    expect(cairoRow.props.accessibilityState).toEqual({ checked: true })

    const dubaiRow = screen.getByLabelText('Dubai, United Arab Emirates')
    expect(dubaiRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('calls onSelect callback after selection', () => {
    const mockOnSelect = jest.fn()
    render(<CityPicker onSelect={mockOnSelect} />)

    fireEvent.press(screen.getByLabelText('Cairo, Egypt'))

    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

  it('announces for accessibility on selection', () => {
    render(<CityPicker />)

    fireEvent.press(screen.getByLabelText('Cairo, Egypt'))

    expect(announceForAccessibilitySpy).toHaveBeenCalledWith('Cairo selected')
  })

  it('rows have accessibilityRole="radio"', () => {
    render(<CityPicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios.length).toBeGreaterThanOrEqual(5)
  })

  it('TextInput has accessibilityLabel', () => {
    render(<CityPicker />)

    expect(screen.getByLabelText('Search cities...')).toBeTruthy()
  })

  it('shows country name as secondary text', () => {
    render(<CityPicker />)

    expect(screen.getByText('Egypt')).toBeTruthy()
    expect(screen.getByText('Morocco')).toBeTruthy()
    expect(screen.getByText('Turkey')).toBeTruthy()
  })

  it('applies RTL text alignment when I18nManager.isRTL is true', () => {
    const { I18nManager } = require('react-native')
    const originalIsRTL = I18nManager.isRTL
    I18nManager.isRTL = true

    render(<CityPicker />)

    const searchInput = screen.getByPlaceholderText('Search cities...')
    const flattenedStyle = Array.isArray(searchInput.props.style)
      ? Object.assign({}, ...searchInput.props.style)
      : searchInput.props.style
    expect(flattenedStyle.textAlign).toBe('right')
    expect(flattenedStyle.writingDirection).toBe('rtl')

    I18nManager.isRTL = originalIsRTL
  })

  it('filters with partial match (shows "ca" matches both Cairo and Casablanca)', () => {
    render(<CityPicker />)

    fireEvent.changeText(screen.getByPlaceholderText('Search cities...'), 'ca')

    expect(screen.getByText('Cairo')).toBeTruthy()
    expect(screen.getByText('Casablanca')).toBeTruthy()
    expect(screen.queryByText('Dubai')).toBeNull()
  })
})
