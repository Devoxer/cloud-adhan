import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

import { AthanSoundPicker } from '@/components/settings/AthanSoundPicker'
import { Prayer } from '@/types/prayer'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock expo-audio service
let mockCurrentSoundId: string | null = null
const mockPlayPreview = jest.fn().mockResolvedValue(undefined)
const mockStopPreview = jest.fn()
jest.mock('@/services/audio', () => ({
  audioPreviewService: {
    get currentSoundId() { return mockCurrentSoundId },
    playPreview: (...args: unknown[]) => {
      mockCurrentSoundId = args[0] as string
      return mockPlayPreview(...args)
    },
    stopPreview: () => {
      mockCurrentSoundId = null
      mockStopPreview()
    },
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
        error: '#E74C3C',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        h3: { size: 18, weight: '600', lineHeight: 1.3 },
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
        'settings.categoryAthan': 'Athan',
        'settings.categoryTone': 'Tones',
        'settings.categoryVibration': 'Vibration',
        'settings.categorySpecial': 'Special',
        'settings.categorySilent': 'Silent',
        'settings.athanMakkah': 'Makkah',
        'settings.athanMadinah': 'Madinah',
        'settings.athanAlaqsa': 'Al-Aqsa',
        'settings.athanMishary': 'Mishary Rashid',
        'settings.athanAbdulBasit': 'Abdul Basit',
        'settings.athanAliMulla': 'Ali Ahmed Mulla',
        'settings.athanMakkahShort': 'Makkah (Short)',
        'settings.athanMadinahShort': 'Madinah (Short)',
        'settings.toneSoftChime': 'Soft Chime',
        'settings.toneBell': 'Bell',
        'settings.toneGentleAlert': 'Gentle Alert',
        'settings.toneTakbeer': 'Takbeer Only',
        'settings.vibrationSinglePulse': 'Single Pulse',
        'settings.vibrationDoublePulse': 'Double Pulse',
        'settings.vibrationGentleWave': 'Gentle Wave',
        'settings.vibrationStrongBuzz': 'Strong Buzz',
        'settings.fajrMakkah': 'Makkah (Fajr)',
        'settings.fajrMishary': 'Mishary Rashid (Fajr)',
        'settings.specialWakeUp': 'Wake Up (Loud)',
        'settings.specialTakbeeratEid': 'Takbeerat Eid',
        'settings.silentOption': 'Silent',
        'settings.previewSound': `Preview ${params?.name ?? ''}`,
        'settings.stopPreview': 'Stop preview',
        'settings.previewFailed': 'Could not play preview',
        'prayer.fajr': 'Fajr',
        'prayer.dhuhr': 'Dhuhr',
        'common.loading': 'Loading',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock settings store
const mockSetPrayerSound = jest.fn()
const mockSettingsState: Record<string, unknown> = {
  prayerSounds: {
    fajr: 'makkah',
    dhuhr: 'makkah',
    asr: 'makkah',
    maghrib: 'makkah',
    isha: 'makkah',
  },
  setPrayerSound: mockSetPrayerSound,
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
    ;(mockSettingsState.prayerSounds as Record<string, string>) = {
      fajr: 'makkah',
      dhuhr: 'makkah',
      asr: 'makkah',
      maghrib: 'makkah',
      isha: 'makkah',
    }
    mockPlayPreview.mockResolvedValue(undefined)
    mockCurrentSoundId = null
  })

  it('renders category section headers', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    expect(screen.getByText('Athan')).toBeTruthy()
    expect(screen.getByText('Tones')).toBeTruthy()
    expect(screen.getByText('Vibration')).toBeTruthy()
    expect(screen.getByText('Special')).toBeTruthy()
    expect(screen.getAllByText('Silent').length).toBeGreaterThanOrEqual(1)
  })

  it('renders sounds grouped by category', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    // Athan category sounds
    expect(screen.getByText('Makkah')).toBeTruthy()
    expect(screen.getByText('Madinah')).toBeTruthy()
    expect(screen.getByText('Al-Aqsa')).toBeTruthy()
    expect(screen.getByText('Mishary Rashid')).toBeTruthy()

    // Tone sounds
    expect(screen.getByText('Soft Chime')).toBeTruthy()
    expect(screen.getByText('Bell')).toBeTruthy()

    // Special sounds
    expect(screen.getByText('Makkah (Fajr)')).toBeTruthy()
    expect(screen.getByText('Mishary Rashid (Fajr)')).toBeTruthy()
  })

  it('renders 15+ sounds total', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    const radios = screen.getAllByRole('radio')
    expect(radios.length).toBeGreaterThanOrEqual(15)
  })

  it('tapping a sound calls setPrayerSound with the prayer prop', () => {
    render(<AthanSoundPicker prayer={Prayer.Dhuhr} />)

    fireEvent.press(screen.getByLabelText('Madinah'))
    expect(mockSetPrayerSound).toHaveBeenCalledWith(Prayer.Dhuhr, 'madinah')
  })

  it('shows currently selected sound as checked for the given prayer', () => {
    ;(mockSettingsState.prayerSounds as Record<string, string>).fajr = 'alaqsa'
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    const alaqsaRow = screen.getByLabelText('Al-Aqsa')
    expect(alaqsaRow.props.accessibilityState).toEqual({ checked: true })

    const makkahRow = screen.getByLabelText('Makkah')
    expect(makkahRow.props.accessibilityState).toEqual({ checked: false })
  })

  it('play button triggers audio preview with callbacks', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', {
      onAutoStop: expect.any(Function),
      onError: expect.any(Function),
    })
  })

  it('section headers have header accessibility role', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    const headers = screen.getAllByRole('header')
    expect(headers).toHaveLength(5) // 5 categories
  })

  it('toggling same sound calls stopPreview', async () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', {
      onAutoStop: expect.any(Function),
      onError: expect.any(Function),
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Stop preview')).toBeTruthy()
    })

    fireEvent.press(screen.getByLabelText('Stop preview'))
    expect(mockStopPreview).toHaveBeenCalledTimes(1)
  })

  it('switching to a different sound calls playPreview for the new sound', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('makkah', {
      onAutoStop: expect.any(Function),
      onError: expect.any(Function),
    })

    fireEvent.press(screen.getByLabelText('Preview Madinah'))
    expect(mockPlayPreview).toHaveBeenCalledWith('madinah', {
      onAutoStop: expect.any(Function),
      onError: expect.any(Function),
    })
    expect(mockPlayPreview).toHaveBeenCalledTimes(2)
  })

  it('announces selection for accessibility with prayer name', () => {
    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    fireEvent.press(screen.getByLabelText('Al-Aqsa'))
    expect(mockAnnounce).toHaveBeenCalledWith('Fajr: Al-Aqsa')
  })

  it('calls onError callback and announces when playback fails', async () => {
    mockPlayPreview.mockImplementation((_soundId: string, callbacks: { onError?: (error: Error) => void }) => {
      mockCurrentSoundId = null
      callbacks.onError?.(new Error('Playback failed'))
      return Promise.resolve()
    })

    render(<AthanSoundPicker prayer={Prayer.Fajr} />)

    fireEvent.press(screen.getByLabelText('Preview Makkah'))

    await new Promise(process.nextTick)

    expect(mockAnnounce).toHaveBeenCalledWith('Could not play preview')
  })
})
