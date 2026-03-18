import type { NotifiablePrayer } from '@/types/prayer'

export type SoundCategory = 'athan' | 'tone' | 'vibration' | 'special' | 'silent'

export type AthanSound = {
  id: string
  nameKey: string
  category: SoundCategory
  duration: 'short' | 'long'
  fileName: string
  iosCafFile: string
  androidRawName: string
}

export type PrayerSounds = Record<NotifiablePrayer, string>

const ALL_SOUNDS: AthanSound[] = [
  // Category: athan
  {
    id: 'makkah',
    nameKey: 'settings.athanMakkah',
    category: 'athan',
    duration: 'long',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'madinah',
    nameKey: 'settings.athanMadinah',
    category: 'athan',
    duration: 'long',
    fileName: 'madinah',
    iosCafFile: 'madinah.caf',
    androidRawName: 'madinah',
  },
  {
    id: 'alaqsa',
    nameKey: 'settings.athanAlaqsa',
    category: 'athan',
    duration: 'long',
    fileName: 'alaqsa',
    iosCafFile: 'alaqsa.caf',
    androidRawName: 'alaqsa',
  },
  {
    id: 'mishary',
    nameKey: 'settings.athanMishary',
    category: 'athan',
    duration: 'long',
    fileName: 'mishary',
    iosCafFile: 'mishary.caf',
    androidRawName: 'mishary',
  },
  {
    id: 'abdul-basit',
    nameKey: 'settings.athanAbdulBasit',
    category: 'athan',
    duration: 'long',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'ali-mulla',
    nameKey: 'settings.athanAliMulla',
    category: 'athan',
    duration: 'long',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'makkah-short',
    nameKey: 'settings.athanMakkahShort',
    category: 'athan',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'madinah-short',
    nameKey: 'settings.athanMadinahShort',
    category: 'athan',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  // Category: tone
  {
    id: 'soft-chime',
    nameKey: 'settings.toneSoftChime',
    category: 'tone',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'bell',
    nameKey: 'settings.toneBell',
    category: 'tone',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'gentle-alert',
    nameKey: 'settings.toneGentleAlert',
    category: 'tone',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'takbeer',
    nameKey: 'settings.toneTakbeer',
    category: 'tone',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  // Category: vibration
  {
    id: 'single-pulse',
    nameKey: 'settings.vibrationSinglePulse',
    category: 'vibration',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'double-pulse',
    nameKey: 'settings.vibrationDoublePulse',
    category: 'vibration',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'gentle-wave',
    nameKey: 'settings.vibrationGentleWave',
    category: 'vibration',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'strong-buzz',
    nameKey: 'settings.vibrationStrongBuzz',
    category: 'vibration',
    duration: 'short',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  // Category: special
  {
    id: 'fajr-makkah',
    nameKey: 'settings.fajrMakkah',
    category: 'special',
    duration: 'long',
    fileName: 'fajr-makkah',
    iosCafFile: 'fajr_makkah.caf',
    androidRawName: 'fajr_makkah',
  },
  {
    id: 'fajr-mishary',
    nameKey: 'settings.fajrMishary',
    category: 'special',
    duration: 'long',
    fileName: 'fajr-mishary',
    iosCafFile: 'fajr_mishary.caf',
    androidRawName: 'fajr_mishary',
  },
  {
    id: 'wake-up',
    nameKey: 'settings.specialWakeUp',
    category: 'special',
    duration: 'long',
    fileName: 'fajr-makkah',
    iosCafFile: 'fajr_makkah.caf',
    androidRawName: 'fajr_makkah',
  },
  {
    id: 'takbeerat-eid',
    nameKey: 'settings.specialTakbeeratEid',
    category: 'special',
    duration: 'long',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  // Category: silent
  {
    id: 'silent',
    nameKey: 'settings.silentOption',
    category: 'silent',
    duration: 'short',
    fileName: '',
    iosCafFile: '',
    androidRawName: '',
  },
]

// Backward-compatible arrays (DO NOT remove)
const ATHAN_SOUNDS: AthanSound[] = ALL_SOUNDS.filter(
  (s) => s.category === 'athan' && s.duration === 'long',
)
const FAJR_SOUNDS: AthanSound[] = ALL_SOUNDS.filter(
  (s) => s.id === 'fajr-makkah' || s.id === 'fajr-mishary',
)

export const DEFAULT_ATHAN_SOUND = 'makkah'
export const DEFAULT_FAJR_SOUND = 'fajr-makkah'

export const DEFAULT_PRAYER_SOUNDS: PrayerSounds = {
  fajr: 'makkah',
  dhuhr: 'makkah',
  asr: 'makkah',
  maghrib: 'makkah',
  isha: 'makkah',
}

const CATEGORY_ORDER: SoundCategory[] = ['athan', 'tone', 'vibration', 'special', 'silent']

export function getAthanSounds(): AthanSound[] {
  return ATHAN_SOUNDS
}

export function getFajrSounds(): AthanSound[] {
  return FAJR_SOUNDS
}

export function getSoundById(id: string): AthanSound | undefined {
  return ALL_SOUNDS.find((s) => s.id === id)
}

export function getAllSounds(): AthanSound[] {
  return ALL_SOUNDS
}

export function getSoundsByCategory(): { category: SoundCategory; sounds: AthanSound[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    sounds: ALL_SOUNDS.filter((s) => s.category === category),
  })).filter((group) => group.sounds.length > 0)
}

export function getSoundCategories(): SoundCategory[] {
  return CATEGORY_ORDER
}
