const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')

function withAlarmManagerPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    const permissions = [
      'android.permission.USE_EXACT_ALARM',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
    ]
    if (!manifest['uses-permission']) manifest['uses-permission'] = []
    for (const perm of permissions) {
      if (!manifest['uses-permission'].some((p) => p.$['android:name'] === perm)) {
        manifest['uses-permission'].push({ $: { 'android:name': perm } })
      }
    }

    const app = manifest.application[0]
    if (!app.receiver) app.receiver = []
    if (!app.service) app.service = []

    // AlarmReceiver
    if (!app.receiver.some((r) => r.$['android:name'] === 'expo.modules.alarmmanager.AlarmReceiver')) {
      app.receiver.push({
        $: { 'android:name': 'expo.modules.alarmmanager.AlarmReceiver', 'android:exported': 'false' },
      })
    }

    // BootReceiver
    if (!app.receiver.some((r) => r.$['android:name'] === 'expo.modules.alarmmanager.BootReceiver')) {
      app.receiver.push({
        $: { 'android:name': 'expo.modules.alarmmanager.BootReceiver', 'android:exported': 'true' },
        'intent-filter': [
          { action: [{ $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } }] },
        ],
      })
    }

    // AthanService
    if (
      !app.service.some((s) => s.$['android:name'] === 'expo.modules.alarmmanager.AthanService')
    ) {
      app.service.push({
        $: {
          'android:name': 'expo.modules.alarmmanager.AthanService',
          'android:foregroundServiceType': 'mediaPlayback',
          'android:exported': 'false',
        },
      })
    }

    return config
  })
}

function withAthanAudioResources(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot
      const resRawDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'raw',
      )
      fs.mkdirSync(resRawDir, { recursive: true })

      const audioMap = {
        'makkah.mp3': 'makkah.mp3',
        'madinah.mp3': 'madinah.mp3',
        'alaqsa.mp3': 'alaqsa.mp3',
        'mishary.mp3': 'mishary.mp3',
        'fajr_makkah.mp3': 'fajr_makkah.mp3',
        'fajr_mishary.mp3': 'fajr_mishary.mp3',
      }
      for (const [srcFile, destFile] of Object.entries(audioMap)) {
        const src = path.join(projectRoot, 'assets', 'audio', srcFile)
        const dest = path.join(resRawDir, destFile)
        if (fs.existsSync(src)) fs.copyFileSync(src, dest)
      }
      return config
    },
  ])
}

module.exports = (config) => {
  config = withAlarmManagerPermissions(config)
  config = withAthanAudioResources(config)
  return config
}
