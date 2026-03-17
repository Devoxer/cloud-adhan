package expo.modules.alarmmanager

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

class AthanService : Service() {
  private var mediaPlayer: MediaPlayer? = null
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // Stop any existing playback before starting new (handles concurrent alarms)
    stopPlayback()

    val prayerId = intent?.getStringExtra("prayerId") ?: "unknown"
    val soundName = intent?.getStringExtra("soundName") ?: "makkah"

    val prayerName = prayerId.substringBefore("-")

    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(prayerName.replaceFirstChar { it.uppercase() })
      .setContentText("Athan")
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setOngoing(true)
      .build()

    ServiceCompat.startForeground(
      this, NOTIFICATION_ID, notification,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
      else 0
    )

    val powerManager = getSystemService(POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK, "CloudAthan::AthanPlayback"
    ).apply { acquire(5 * 60 * 1000L) }

    playAthan(soundName)

    return START_NOT_STICKY
  }

  private fun playAthan(soundName: String) {
    val resId = resources.getIdentifier(soundName, "raw", packageName)
    if (resId == 0) { stopPlayback(); return }

    val audioAttrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
      .build()

    mediaPlayer = MediaPlayer.create(this, resId, audioAttrs, 0)?.apply {
      setOnErrorListener { _, _, _ -> stopPlayback(); true }
      setOnCompletionListener { stopPlayback() }
      start()
    } ?: run { stopPlayback(); return }
  }

  private fun stopPlayback() {
    mediaPlayer?.release()
    mediaPlayer = null
    wakeLock?.let { if (it.isHeld) it.release() }
    wakeLock = null
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    stopPlayback()
    super.onDestroy()
  }

  companion object {
    const val CHANNEL_ID = "prayer-alerts"
    const val NOTIFICATION_ID = 2001
  }
}
