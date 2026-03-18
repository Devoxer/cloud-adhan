import { type AudioPlayer, createAudioPlayer } from 'expo-audio'

import { captureError } from '@/utils/sentry'

const makkahAsset = require('@/assets/audio/makkah.mp3')
const fajrMakkahAsset = require('@/assets/audio/fajr_makkah.mp3')

const SOUND_ASSETS: Record<string, number> = {
  makkah: makkahAsset,
  madinah: require('@/assets/audio/madinah.mp3'),
  alaqsa: require('@/assets/audio/alaqsa.mp3'),
  mishary: require('@/assets/audio/mishary.mp3'),
  'fajr-makkah': fajrMakkahAsset,
  'fajr-mishary': require('@/assets/audio/fajr_mishary.mp3'),
  // Placeholder sounds — mapped to existing assets until real audio is sourced
  'abdul-basit': makkahAsset,
  'ali-mulla': makkahAsset,
  'makkah-short': makkahAsset,
  'madinah-short': makkahAsset,
  'soft-chime': makkahAsset,
  bell: makkahAsset,
  'gentle-alert': makkahAsset,
  takbeer: makkahAsset,
  'single-pulse': makkahAsset,
  'double-pulse': makkahAsset,
  'gentle-wave': makkahAsset,
  'strong-buzz': makkahAsset,
  'wake-up': fajrMakkahAsset,
  'takbeerat-eid': makkahAsset,
}

const PREVIEW_DURATION_MS = 5000
const READINESS_TIMEOUT_MS = 3000

type PreviewCallbacks = {
  onAutoStop?: () => void
  onError?: (error: Error) => void
}

class AudioPreviewService {
  private player: AudioPlayer | null = null
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null
  private readinessTimeout: ReturnType<typeof setTimeout> | null = null
  private readinessSubscription: { remove: () => void } | null = null
  private _currentSoundId: string | null = null

  get currentSoundId(): string | null {
    return this._currentSoundId
  }

  get isPlaying(): boolean {
    return this._currentSoundId !== null
  }

  async playPreview(soundId: string, callbacks: PreviewCallbacks = {}): Promise<void> {
    this.stopPreview()

    const asset = SOUND_ASSETS[soundId]
    if (asset == null) return

    try {
      this.player = createAudioPlayer(asset)
      this._currentSoundId = soundId

      await this.waitForPlayback(this.player)
    } catch (error) {
      captureError(error, { service: 'audio', operation: 'playPreview', soundId })
      this.stopPreview()
      callbacks.onError?.(error instanceof Error ? error : new Error('Playback failed'))
      return
    }

    this.autoStopTimer = setTimeout(() => {
      this.stopPreview()
      callbacks.onAutoStop?.()
    }, PREVIEW_DURATION_MS)
  }

  stopPreview(): void {
    if (this.readinessTimeout) {
      clearTimeout(this.readinessTimeout)
      this.readinessTimeout = null
    }

    if (this.readinessSubscription) {
      this.readinessSubscription.remove()
      this.readinessSubscription = null
    }

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

  private waitForPlayback(player: AudioPlayer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.readinessTimeout = setTimeout(() => {
        this.readinessSubscription?.remove()
        this.readinessSubscription = null
        this.readinessTimeout = null
        reject(new Error('Audio player readiness timeout'))
      }, READINESS_TIMEOUT_MS)

      this.readinessSubscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing) {
          if (this.readinessTimeout) {
            clearTimeout(this.readinessTimeout)
            this.readinessTimeout = null
          }
          this.readinessSubscription?.remove()
          this.readinessSubscription = null
          resolve()
        }
      })

      player.play()
    })
  }
}

export const audioPreviewService = new AudioPreviewService()
