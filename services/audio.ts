import { type AudioPlayer, createAudioPlayer } from 'expo-audio'

import { captureError } from '@/utils/sentry'

const SOUND_ASSETS: Record<string, number> = {
  makkah: require('@/assets/audio/makkah.mp3'),
  madinah: require('@/assets/audio/madinah.mp3'),
  alaqsa: require('@/assets/audio/alaqsa.mp3'),
  mishary: require('@/assets/audio/mishary.mp3'),
  'fajr-makkah': require('@/assets/audio/fajr_makkah.mp3'),
  'fajr-mishary': require('@/assets/audio/fajr_mishary.mp3'),
}

const PREVIEW_DURATION_MS = 5000

class AudioPreviewService {
  private player: AudioPlayer | null = null
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null
  private _currentSoundId: string | null = null

  get currentSoundId(): string | null {
    return this._currentSoundId
  }

  get isPlaying(): boolean {
    return this._currentSoundId !== null
  }

  playPreview(soundId: string, onAutoStop?: () => void): void {
    this.stopPreview()

    const asset = SOUND_ASSETS[soundId]
    if (asset == null) return

    try {
      this.player = createAudioPlayer(asset)
      this._currentSoundId = soundId
      this.player.play()
    } catch (error) {
      captureError(error, { service: 'audio', operation: 'playPreview', soundId })
      this.stopPreview()
      return
    }

    this.autoStopTimer = setTimeout(() => {
      this.stopPreview()
      onAutoStop?.()
    }, PREVIEW_DURATION_MS)
  }

  stopPreview(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer)
      this.autoStopTimer = null
    }

    if (this.player) {
      this.player.remove()
      this.player = null
    }

    this._currentSoundId = null
  }
}

export const audioPreviewService = new AudioPreviewService()
