const mockPlay = jest.fn()
const mockRemove = jest.fn()
const mockSubscriptionRemove = jest.fn()

let statusListener: ((status: { playing: boolean }) => void) | null = null

const mockPlayer = {
  play: mockPlay,
  remove: mockRemove,
  addListener: jest.fn((event: string, callback: (status: { playing: boolean }) => void) => {
    if (event === 'playbackStatusUpdate') {
      statusListener = callback
    }
    return { remove: mockSubscriptionRemove }
  }),
}

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayer),
}))

import { createAudioPlayer } from 'expo-audio'
import { audioPreviewService } from '@/services/audio'

const mockCreateAudioPlayer = createAudioPlayer as jest.Mock

function simulatePlaybackStart() {
  statusListener?.({ playing: true })
}

describe('services/audio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    statusListener = null
    audioPreviewService.stopPreview()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('playPreview', () => {
    it('creates a player, listens for status, and calls play()', async () => {
      const promise = audioPreviewService.playPreview('makkah')
      simulatePlaybackStart()
      await promise

      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1)
      expect(mockPlayer.addListener).toHaveBeenCalledWith('playbackStatusUpdate', expect.any(Function))
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('sets currentSoundId and isPlaying after playback starts', async () => {
      const promise = audioPreviewService.playPreview('madinah')
      simulatePlaybackStart()
      await promise

      expect(audioPreviewService.currentSoundId).toBe('madinah')
      expect(audioPreviewService.isPlaying).toBe(true)
    })

    it('stops previous preview before starting new one', async () => {
      const promise1 = audioPreviewService.playPreview('makkah')
      simulatePlaybackStart()
      await promise1

      jest.clearAllMocks()
      statusListener = null

      const promise2 = audioPreviewService.playPreview('alaqsa')
      simulatePlaybackStart()
      await promise2

      expect(mockRemove).toHaveBeenCalledTimes(1)
      expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1)
      expect(audioPreviewService.currentSoundId).toBe('alaqsa')
    })

    it('does nothing for invalid sound ID', async () => {
      await audioPreviewService.playPreview('nonexistent')

      expect(mockCreateAudioPlayer).not.toHaveBeenCalled()
      expect(audioPreviewService.isPlaying).toBe(false)
    })

    it('calls onError callback on readiness timeout', async () => {
      const onError = jest.fn()
      const promise = audioPreviewService.playPreview('makkah', { onError })

      // Advance past readiness timeout (3 seconds)
      jest.advanceTimersByTime(3000)
      await promise

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(audioPreviewService.isPlaying).toBe(false)
    })

    it('removes event subscription when playback starts', async () => {
      const promise = audioPreviewService.playPreview('makkah')
      simulatePlaybackStart()
      await promise

      expect(mockSubscriptionRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('auto-stop', () => {
    it('stops after 5 seconds', async () => {
      const promise = audioPreviewService.playPreview('makkah')
      simulatePlaybackStart()
      await promise

      expect(audioPreviewService.isPlaying).toBe(true)

      jest.advanceTimersByTime(5000)

      expect(mockRemove).toHaveBeenCalled()
      expect(audioPreviewService.isPlaying).toBe(false)
      expect(audioPreviewService.currentSoundId).toBeNull()
    })

    it('calls onAutoStop callback when auto-stopping', async () => {
      const onAutoStop = jest.fn()
      const promise = audioPreviewService.playPreview('makkah', { onAutoStop })
      simulatePlaybackStart()
      await promise

      jest.advanceTimersByTime(5000)

      expect(onAutoStop).toHaveBeenCalledTimes(1)
    })

    it('does not call onAutoStop if manually stopped', async () => {
      const onAutoStop = jest.fn()
      const promise = audioPreviewService.playPreview('makkah', { onAutoStop })
      simulatePlaybackStart()
      await promise

      audioPreviewService.stopPreview()

      jest.advanceTimersByTime(5000)

      expect(onAutoStop).not.toHaveBeenCalled()
    })
  })

  describe('stopPreview', () => {
    it('calls remove() on the player', async () => {
      const promise = audioPreviewService.playPreview('makkah')
      simulatePlaybackStart()
      await promise
      jest.clearAllMocks()

      audioPreviewService.stopPreview()

      expect(mockRemove).toHaveBeenCalledTimes(1)
    })

    it('resets state', async () => {
      const promise = audioPreviewService.playPreview('mishary')
      simulatePlaybackStart()
      await promise

      audioPreviewService.stopPreview()

      expect(audioPreviewService.currentSoundId).toBeNull()
      expect(audioPreviewService.isPlaying).toBe(false)
    })

    it('is safe to call when nothing is playing', () => {
      expect(() => audioPreviewService.stopPreview()).not.toThrow()
    })

    it('cancels readiness timeout when called during loading', async () => {
      const onError = jest.fn()
      audioPreviewService.playPreview('makkah', { onError })

      // Stop before readiness resolves — should clean up internal timeout
      audioPreviewService.stopPreview()

      // Advance past readiness timeout — onError should NOT fire
      jest.advanceTimersByTime(3000)

      expect(onError).not.toHaveBeenCalled()
      expect(mockSubscriptionRemove).toHaveBeenCalled()
    })
  })
})
