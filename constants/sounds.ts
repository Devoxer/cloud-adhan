export type AthanSound = {
  id: string
  nameKey: string
  fileName: string
  iosCafFile: string
  androidRawName: string
}

const ATHAN_SOUNDS: AthanSound[] = [
  {
    id: 'makkah',
    nameKey: 'settings.athanMakkah',
    fileName: 'makkah',
    iosCafFile: 'makkah.caf',
    androidRawName: 'makkah',
  },
  {
    id: 'madinah',
    nameKey: 'settings.athanMadinah',
    fileName: 'madinah',
    iosCafFile: 'madinah.caf',
    androidRawName: 'madinah',
  },
  {
    id: 'alaqsa',
    nameKey: 'settings.athanAlaqsa',
    fileName: 'alaqsa',
    iosCafFile: 'alaqsa.caf',
    androidRawName: 'alaqsa',
  },
  {
    id: 'mishary',
    nameKey: 'settings.athanMishary',
    fileName: 'mishary',
    iosCafFile: 'mishary.caf',
    androidRawName: 'mishary',
  },
]

const FAJR_SOUNDS: AthanSound[] = [
  {
    id: 'fajr-makkah',
    nameKey: 'settings.fajrMakkah',
    fileName: 'fajr-makkah',
    iosCafFile: 'fajr_makkah.caf',
    androidRawName: 'fajr_makkah',
  },
  {
    id: 'fajr-mishary',
    nameKey: 'settings.fajrMishary',
    fileName: 'fajr-mishary',
    iosCafFile: 'fajr_mishary.caf',
    androidRawName: 'fajr_mishary',
  },
]

export const DEFAULT_ATHAN_SOUND = 'makkah'
export const DEFAULT_FAJR_SOUND = 'fajr-makkah'

export function getAthanSounds(): AthanSound[] {
  return ATHAN_SOUNDS
}

export function getFajrSounds(): AthanSound[] {
  return FAJR_SOUNDS
}

export function getSoundById(id: string): AthanSound | undefined {
  return [...ATHAN_SOUNDS, ...FAJR_SOUNDS].find((s) => s.id === id)
}
