import fs from 'fs'
import path from 'path'

// Mock expo/config-plugins before requiring the plugin
jest.mock('expo/config-plugins', () => ({
  withAndroidManifest: jest.fn((config, callback) => {
    // Simulate calling the callback with config that has modResults
    return callback(config)
  }),
  withDangerousMod: jest.fn((config, [_platform, callback]) => {
    // Store the callback for later invocation in tests
    config._dangerousModCallback = callback
    return config
  }),
}))

jest.mock('fs')

function makeExpoConfig() {
  return {
    modResults: {
      manifest: {
        'uses-permission': [] as Array<{ $: { 'android:name': string } }>,
        application: [
          {
            receiver: [] as Array<{
              $: { 'android:name': string; 'android:exported': string }
              'intent-filter'?: Array<{
                action: Array<{ $: { 'android:name': string } }>
              }>
            }>,
            service: [] as Array<{
              $: {
                'android:name': string
                'android:foregroundServiceType'?: string
                'android:exported': string
              }
            }>,
          },
        ],
      },
    },
    modRequest: {
      projectRoot: '/fake/project',
      platformProjectRoot: '/fake/project/android',
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('../../modules/alarm-manager/app.plugin.js')

describe('alarm-manager config plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fs.mkdirSync as jest.Mock).mockReturnValue(undefined)
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.copyFileSync as jest.Mock).mockReturnValue(undefined)
  })

  describe('permissions', () => {
    it('adds all required permissions to manifest', () => {
      const config = makeExpoConfig()
      plugin(config)

      const permissions = config.modResults.manifest['uses-permission']
      const permNames = permissions.map((p) => p.$['android:name'])

      expect(permNames).toContain('android.permission.USE_EXACT_ALARM')
      expect(permNames).toContain('android.permission.SCHEDULE_EXACT_ALARM')
      expect(permNames).toContain('android.permission.FOREGROUND_SERVICE')
      expect(permNames).toContain('android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK')
      expect(permNames).toContain('android.permission.RECEIVE_BOOT_COMPLETED')
      expect(permNames).toContain('android.permission.WAKE_LOCK')
    })

    it('does not add duplicate permissions', () => {
      const config = makeExpoConfig()
      config.modResults.manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.WAKE_LOCK' },
      })

      plugin(config)

      const wakeCount = config.modResults.manifest['uses-permission'].filter(
        (p) => p.$['android:name'] === 'android.permission.WAKE_LOCK',
      ).length
      expect(wakeCount).toBe(1)
    })
  })

  describe('receivers and service', () => {
    it('registers AlarmReceiver as non-exported', () => {
      const config = makeExpoConfig()
      plugin(config)

      const app = config.modResults.manifest.application[0]
      const alarmReceiver = app.receiver.find(
        (r) => r.$['android:name'] === 'expo.modules.alarmmanager.AlarmReceiver',
      )
      expect(alarmReceiver).toBeDefined()
      expect(alarmReceiver!.$['android:exported']).toBe('false')
    })

    it('registers BootReceiver with BOOT_COMPLETED intent-filter', () => {
      const config = makeExpoConfig()
      plugin(config)

      const app = config.modResults.manifest.application[0]
      const bootReceiver = app.receiver.find(
        (r) => r.$['android:name'] === 'expo.modules.alarmmanager.BootReceiver',
      )
      expect(bootReceiver).toBeDefined()
      expect(bootReceiver!.$['android:exported']).toBe('true')
      expect(bootReceiver!['intent-filter']![0].action[0].$['android:name']).toBe(
        'android.intent.action.BOOT_COMPLETED',
      )
    })

    it('registers AthanService with mediaPlayback foregroundServiceType', () => {
      const config = makeExpoConfig()
      plugin(config)

      const app = config.modResults.manifest.application[0]
      const service = app.service.find(
        (s) => s.$['android:name'] === 'expo.modules.alarmmanager.AthanService',
      )
      expect(service).toBeDefined()
      expect(service!.$['android:foregroundServiceType']).toBe('mediaPlayback')
      expect(service!.$['android:exported']).toBe('false')
    })

    it('does not add duplicate receivers', () => {
      const config = makeExpoConfig()
      // Call plugin twice
      plugin(config)
      plugin(config)

      const app = config.modResults.manifest.application[0]
      const alarmReceiverCount = app.receiver.filter(
        (r) => r.$['android:name'] === 'expo.modules.alarmmanager.AlarmReceiver',
      ).length
      expect(alarmReceiverCount).toBe(1)
    })
  })

  describe('audio resources', () => {
    it('copies existing audio files to res/raw', async () => {
      const config = makeExpoConfig()
      plugin(config)

      // Execute the dangerous mod callback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modifiedConfig = config as any
      if (modifiedConfig._dangerousModCallback) {
        await modifiedConfig._dangerousModCallback(config)
      }

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('app', 'src', 'main', 'res', 'raw')),
        { recursive: true },
      )
      // 6 audio files should be checked and copied
      expect(fs.existsSync).toHaveBeenCalledTimes(6)
      expect(fs.copyFileSync).toHaveBeenCalledTimes(6)
    })

    it('skips missing audio files gracefully', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      const config = makeExpoConfig()
      plugin(config)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modifiedConfig = config as any
      if (modifiedConfig._dangerousModCallback) {
        await modifiedConfig._dangerousModCallback(config)
      }

      expect(fs.copyFileSync).not.toHaveBeenCalled()
    })
  })

  describe('plugin export', () => {
    it('exports a function', () => {
      expect(typeof plugin).toBe('function')
    })
  })
})
