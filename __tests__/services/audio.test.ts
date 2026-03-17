const mockPlay = jest.fn()
const mockRemove = jest.fn()
const mockPlayer = { play: mockPlay, remove: mockRemove }

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayer),
}))

import { createAudioPlayer } from 'expo-audio'
import { audioPreviewService } from '@/services/audio'

const mockCreateAudioPlayer = createAudioPlayer as jest.Mock

describe('services/audio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    audioPreviewService.stopPreview()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('playPreview', () => {
    it('creates a player and calls play()', () => {
      audioPreviewService.playPreview('makkah')

      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1)
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('sets currentSoundId and isPlaying', () => {
      audioPreviewService.playPreview('madinah')

      expect(audioPreviewService.currentSoundId).toBe('madinah')
      expect(audioPreviewService.isPlaying).toBe(true)
    })

    it('stops previous preview before starting new one', () => {
      audioPreviewService.playPreview('makkah')
      jest.clearAllMocks()

      audioPreviewService.playPreview('alaqsa')

      expect(mockRemove).toHaveBeenCalledTimes(1)
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1)
      expect(audioPreviewService.currentSoundId).toBe('alaqsa')
    })

    it('does nothing for invalid sound ID', () => {
      audioPreviewService.playPreview('nonexistent')

      expect(mockCreateAudioPlayer).not.toHaveBeenCalled()
      expect(audioPreviewService.isPlaying).toBe(false)
    })
  })

  describe('auto-stop', () => {
    it('stops after 5 seconds', () => {
      audioPreviewService.playPreview('makkah')
      expect(audioPreviewService.isPlaying).toBe(true)

      jest.advanceTimersByTime(5000)

      expect(mockRemove).toHaveBeenCalled()
      expect(audioPreviewService.isPlaying).toBe(false)
      expect(audioPreviewService.currentSoundId).toBeNull()
    })

    it('calls onAutoStop callback when auto-stopping', () => {
      const onAutoStop = jest.fn()
      audioPreviewService.playPreview('makkah', onAutoStop)

      jest.advanceTimersByTime(5000)

      expect(onAutoStop).toHaveBeenCalledTimes(1)
    })

    it('does not call onAutoStop if manually stopped', () => {
      const onAutoStop = jest.fn()
      audioPreviewService.playPreview('makkah', onAutoStop)
      audioPreviewService.stopPreview()

      jest.advanceTimersByTime(5000)

      expect(onAutoStop).not.toHaveBeenCalled()
    })
  })

  describe('stopPreview', () => {
    it('calls remove() on the player', () => {
      audioPreviewService.playPreview('makkah')
      jest.clearAllMocks()

      audioPreviewService.stopPreview()

      expect(mockRemove).toHaveBeenCalledTimes(1)
    })

    it('resets state', () => {
      audioPreviewService.playPreview('mishary')
      audioPreviewService.stopPreview()

      expect(audioPreviewService.currentSoundId).toBeNull()
      expect(audioPreviewService.isPlaying).toBe(false)
    })

    it('is safe to call when nothing is playing', () => {
      expect(() => audioPreviewService.stopPreview()).not.toThrow()
    })
  })
})
