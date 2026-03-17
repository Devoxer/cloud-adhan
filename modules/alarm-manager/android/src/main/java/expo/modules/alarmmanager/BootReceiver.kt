package expo.modules.alarmmanager

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

    val prefs = context.getSharedPreferences(AlarmManagerModule.PREFS_NAME, Context.MODE_PRIVATE)
    val alarmIds = prefs.getStringSet(AlarmManagerModule.KEY_ALARM_IDS, emptySet()) ?: emptySet()
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val now = System.currentTimeMillis()

    val pastIds = mutableListOf<String>()

    for (id in alarmIds) {
      val timestamp = prefs.getLong("${AlarmManagerModule.KEY_PREFIX_TIME}$id", 0L)
      if (timestamp <= now) {
        pastIds.add(id)
        continue
      }

      val soundName = prefs.getString("${AlarmManagerModule.KEY_PREFIX_SOUND}$id", "makkah") ?: "makkah"
      val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
        putExtra("prayerId", id)
        putExtra("soundName", soundName)
      }
      val pendingIntent = PendingIntent.getBroadcast(
        context, id.hashCode(), alarmIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val showIntent = PendingIntent.getActivity(
        context, 0,
        context.packageManager.getLaunchIntentForPackage(context.packageName),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      alarmManager.setAlarmClock(
        AlarmManager.AlarmClockInfo(timestamp, showIntent),
        pendingIntent
      )
    }

    // Clean up past alarm entries from SharedPreferences
    if (pastIds.isNotEmpty()) {
      val remainingIds = alarmIds.toMutableSet()
      val editor = prefs.edit()
      for (id in pastIds) {
        remainingIds.remove(id)
        editor.remove("${AlarmManagerModule.KEY_PREFIX_TIME}$id")
        editor.remove("${AlarmManagerModule.KEY_PREFIX_SOUND}$id")
      }
      editor.putStringSet(AlarmManagerModule.KEY_ALARM_IDS, remainingIds)
      editor.apply()
    }
  }
}
