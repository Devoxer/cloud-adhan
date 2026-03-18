import { fireEvent, render, screen } from '@testing-library/react-native'

import { ElevationRulePicker } from '@/components/settings/ElevationRulePicker'

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
      },
      spacing: { xs: 4, sm: 8, md: 16 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        caption: { size: 12, weight: '400', lineHeight: 1.4 },
      },
      radii: { md: 12 },
    },
  })),
}))

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'settings.elevationRule': 'Elevation Rule',
        'settings.elevationSeaLevel': 'Sea Level',
        'settings.elevationAutomatic': 'Automatic',
        'settings.elevationSeaLevelDesc': 'Ignore elevation in calculations',
        'settings.elevationAutomaticDesc': 'Use device altitude when available (not yet supported)',
      }
      return map[key] ?? key
    },
  }),
}))

// Mock settings store
const mockSetElevationRule = jest.fn()
let mockElevationRule = 'seaLevel'

jest.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      elevationRule: mockElevationRule,
      setElevationRule: mockSetElevationRule,
    }),
}))

describe('ElevationRulePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockElevationRule = 'seaLevel'
  })

  it('renders 2 options', () => {
    render(<ElevationRulePicker />)

    expect(screen.getByText('Sea Level')).toBeTruthy()
    expect(screen.getByText('Automatic')).toBeTruthy()
  })

  it('shows description text for each option', () => {
    render(<ElevationRulePicker />)

    expect(screen.getByText('Ignore elevation in calculations')).toBeTruthy()
    expect(screen.getByText('Use device altitude when available (not yet supported)')).toBeTruthy()
  })

  it('selecting an option calls setElevationRule and onSelect', () => {
    const onSelect = jest.fn()
    render(<ElevationRulePicker onSelect={onSelect} />)

    fireEvent.press(screen.getByText('Automatic'))

    expect(mockSetElevationRule).toHaveBeenCalledWith('automatic')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
