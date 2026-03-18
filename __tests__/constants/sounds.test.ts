import {
  type AthanSound,
  DEFAULT_PRAYER_SOUNDS,
  getAllSounds,
  getAthanSounds,
  getFajrSounds,
  getSoundById,
  getSoundCategories,
  getSoundsByCategory,
  type SoundCategory,
} from '@/constants/sounds'

describe('constants/sounds', () => {
  describe('getAllSounds', () => {
    it('returns 15+ sounds', () => {
      const sounds = getAllSounds()
      expect(sounds.length).toBeGreaterThanOrEqual(15)
    })

    it('each sound has all required metadata fields', () => {
      const sounds = getAllSounds()
      for (const sound of sounds) {
        expect(sound).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            nameKey: expect.any(String),
            category: expect.any(String),
            duration: expect.any(String),
            fileName: expect.any(String),
            iosCafFile: expect.any(String),
            androidRawName: expect.any(String),
          }),
        )
      }
    })

    it('each sound has a valid category', () => {
      const validCategories: SoundCategory[] = ['athan', 'tone', 'vibration', 'special', 'silent']
      const sounds = getAllSounds()
      for (const sound of sounds) {
        expect(validCategories).toContain(sound.category)
      }
    })

    it('each sound has a valid duration', () => {
      const sounds = getAllSounds()
      for (const sound of sounds) {
        expect(['short', 'long']).toContain(sound.duration)
      }
    })

    it('all sound IDs are unique', () => {
      const sounds = getAllSounds()
      const ids = sounds.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('getSoundsByCategory', () => {
    it('returns groups for all categories that have sounds', () => {
      const groups = getSoundsByCategory()
      expect(groups.length).toBeGreaterThanOrEqual(4)
      for (const group of groups) {
        expect(group.category).toBeDefined()
        expect(group.sounds.length).toBeGreaterThan(0)
      }
    })

    it('groups contain only sounds of that category', () => {
      const groups = getSoundsByCategory()
      for (const group of groups) {
        for (const sound of group.sounds) {
          expect(sound.category).toBe(group.category)
        }
      }
    })

    it('all sounds are represented across all groups', () => {
      const groups = getSoundsByCategory()
      const groupedCount = groups.reduce((sum, g) => sum + g.sounds.length, 0)
      expect(groupedCount).toBe(getAllSounds().length)
    })
  })

  describe('getSoundCategories', () => {
    it('returns ordered category list', () => {
      const categories = getSoundCategories()
      expect(categories).toEqual(['athan', 'tone', 'vibration', 'special', 'silent'])
    })
  })

  describe('getSoundById', () => {
    it('finds existing sounds by id', () => {
      const makkah = getSoundById('makkah')
      expect(makkah).toBeDefined()
      expect(makkah?.id).toBe('makkah')
      expect(makkah?.category).toBe('athan')
    })

    it('returns undefined for unknown id', () => {
      expect(getSoundById('nonexistent')).toBeUndefined()
    })

    it('finds all sounds by their id', () => {
      const sounds = getAllSounds()
      for (const sound of sounds) {
        expect(getSoundById(sound.id)).toBe(sound)
      }
    })
  })

  describe('DEFAULT_PRAYER_SOUNDS', () => {
    it('has entries for all 5 notifiable prayers', () => {
      expect(DEFAULT_PRAYER_SOUNDS).toEqual({
        fajr: expect.any(String),
        dhuhr: expect.any(String),
        asr: expect.any(String),
        maghrib: expect.any(String),
        isha: expect.any(String),
      })
    })

    it('all default sound IDs exist in the catalog', () => {
      for (const soundId of Object.values(DEFAULT_PRAYER_SOUNDS)) {
        expect(getSoundById(soundId)).toBeDefined()
      }
    })
  })

  describe('backward-compatible exports', () => {
    it('getAthanSounds returns long athan sounds', () => {
      const sounds = getAthanSounds()
      expect(sounds.length).toBeGreaterThanOrEqual(4)
      for (const sound of sounds) {
        expect(sound.category).toBe('athan')
        expect(sound.duration).toBe('long')
      }
    })

    it('getFajrSounds returns fajr-specific sounds', () => {
      const sounds = getFajrSounds()
      expect(sounds.length).toBeGreaterThanOrEqual(2)
      const ids = sounds.map((s) => s.id)
      expect(ids).toContain('fajr-makkah')
      expect(ids).toContain('fajr-mishary')
    })
  })

  describe('silent sound', () => {
    it('has empty fileName, iosCafFile, and androidRawName', () => {
      const silent = getSoundById('silent')
      expect(silent).toBeDefined()
      expect(silent?.fileName).toBe('')
      expect(silent?.iosCafFile).toBe('')
      expect(silent?.androidRawName).toBe('')
    })
  })
})
