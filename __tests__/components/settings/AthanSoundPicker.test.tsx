import { render, screen, fireEvent } from '@testing-library/react-native'

import { AthanSoundPicker } from '@/components/settings/AthanSoundPicker'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock expo-audio service
const mockPlayPreview = jest.fn()
const mockStopPreview = jest.fn()
jest.mock('@/services/audio', () => ({
  audioPreviewService: {
    playPreview: (...args: unknown[]) => mockPlayPreview(...args),
    stopPreview: () => mockStopPreview(),
  },
}))

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
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        h3: { size: 18, weight: '600', lineHeight: 1.3 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
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
        'settings.athanSound': 'Athan Sound',
        'settings.fajrSound': 'Fajr Sound',
        'settings.athanMakkah': 'Makkah',
        'settings.athanMadinah': 'Madinah',
        'settings.athanAlaqsa': 'Al-Aqsa',
        'settings.athanMishary': 'Mishary Rashid',
        'settings.fajrMakkah': 'Makkah (Fajr)',
        'settings.fajrMishary': 'Mishary Rashid (Fajr)',
        'settings.previewSound': `Preview ${params?.name ?? ''}`,
        'settings.stopPreview': 'Stop preview',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
const mockSetAthanSound = jest.fn()
const mockSetFajrSound = jest.fn()
const mockSettingsState = {
  athanSound: 'makkah',
  fajrSound: 'fajr-makkah',
  setAthanSound: mockSetAthanSound,
  setFajrSound: mockSetFajrSound,
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

describe('components/settings/AthanSoundPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSettingsState.athanSound = 'makkah'
    mockSettingsState.fajrSound = 'fajr-makkah'
  })

  it('renders both section headers', () => {
    render(<AthanSoundPicker />)

    expect(screen.getByText('Athan Sound')).toBeTruthy()
    expect(screen.getByText('Fajr Sound')).toBeTruthy()
  })

  it('renders all 4 athan sounds', () => {
    render(<AthanSoundPicker />)

    expect(screen.getByText('Makkah')).toBeTruthy()
    expect(screen.getByText('Madinah')).toBeTruthy()
    expect(screen.getByText('Al-Aqsa')).toBeTruthy()
    expect(screen.getByText('Mishary Rashid')).toBeTruthy()
  })

  it('renders all 2 fajr sounds', () => {
    render(<AthanSoundPicker />)

    expect(screen.getByText('Makkah (Fajr)')).toBeTruthy()
    expect(screen.getByText('Mishary Rashid (Fajr)')).toBeTruthy()
  })

  it('tapping an athan sound calls setAthanSound', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Madinah'))
    expect(mockSetAthanSound).toHaveBeenCalledWith('madinah')
  })

  it('tapping a fajr sound calls setFajrSound', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Mishary Rashid (Fajr)'))
    expect(mockSetFajrSound).toHaveBeenCalledWith('fajr-mishary')
  })

  it('shows currently selected athan sound as checked', () => {
    mockSettingsState.athanSound = 'alaqsa'
    render(<AthanSoundPicker />)

    const alaqsaRow = screen.getByLabelText('Al-Aqsa')
    expect(alaqsaRow.props.accessibilityState).toEqual({ checked: true })

    const makkahRow = screen.getByLabelText('Makkah')
    expect(makkahRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('play button triggers audio preview', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', expect.any(Function))
  })

  it('section headers have header accessibility role', () => {
    render(<AthanSoundPicker />)

    const headers = screen.getAllByRole('header')
    expect(headers).toHaveLength(2)
  })

  it('sound rows have radio accessibility role', () => {
    render(<AthanSoundPicker />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(6)
  })

  it('toggling same sound calls stopPreview', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', expect.any(Function))

    // Pressing the same sound again should toggle it off
    fireEvent.press(screen.getByLabelText('Stop preview'))
    expect(mockStopPreview).toHaveBeenCalledTimes(1)
  })

  it('switching to a different sound calls playPreview for the new sound', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', expect.any(Function))

    fireEvent.press(screen.getByLabelText('Preview Madinah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('madinah', expect.any(Function))
    expect(mockPlayPreview).toHaveBeenCalledTimes(2)
  })

  it('announces selection for accessibility', () => {
    render(<AthanSoundPicker />)

    fireEvent.press(screen.getByLabelText('Al-Aqsa'))
    expect(mockAnnounce).toHaveBeenCalledWith('Athan Sound: Al-Aqsa')
  })
})
