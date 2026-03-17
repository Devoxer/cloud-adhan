package expo.modules.alarmmanager

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlarmManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AlarmManagerModule")

    AsyncFunction("scheduleAlarm") { prayerId: String, timestamp: Double, soundName: String ->
      val context = appContext.reactContext ?: return@AsyncFunction
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

      val intent = Intent(context, AlarmReceiver::class.java).apply {
        putExtra("prayerId", prayerId)
        putExtra("soundName", soundName)
      }
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        prayerId.hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val showIntent = PendingIntent.getActivity(
        context, 0,
        context.packageManager.getLaunchIntentForPackage(context.packageName),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val alarmClockInfo = AlarmManager.AlarmClockInfo(timestamp.toLong(), showIntent)
      alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)

      persistAlarm(context, prayerId, timestamp.toLong(), soundName)
    }

    AsyncFunction("cancelAlarm") { prayerId: String ->
      val context = appContext.reactContext ?: return@AsyncFunction
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val intent = Intent(context, AlarmReceiver::class.java)
      val pendingIntent = PendingIntent.getBroadcast(
        context, prayerId.hashCode(), intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      alarmManager.cancel(pendingIntent)
      removePersistedAlarm(context, prayerId)
    }

    AsyncFunction("cancelAllAlarms") {
      val context = appContext.reactContext ?: return@AsyncFunction
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val alarmIds = prefs.getStringSet(KEY_ALARM_IDS, emptySet()) ?: emptySet()
      for (id in alarmIds) {
        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
          context, id.hashCode(), intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
      }
      prefs.edit().clear().apply()
    }

    AsyncFunction("getScheduledAlarmCount") {
      val context = appContext.reactContext ?: return@AsyncFunction 0
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      (prefs.getStringSet(KEY_ALARM_IDS, emptySet()) ?: emptySet()).size
    }
  }

  private fun persistAlarm(context: Context, prayerId: String, timestamp: Long, soundName: String) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val alarmIds = prefs.getStringSet(KEY_ALARM_IDS, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
    alarmIds.add(prayerId)
    prefs.edit()
      .putStringSet(KEY_ALARM_IDS, alarmIds)
      .putLong("${KEY_PREFIX_TIME}$prayerId", timestamp)
      .putString("${KEY_PREFIX_SOUND}$prayerId", soundName)
      .apply()
  }

  private fun removePersistedAlarm(context: Context, prayerId: String) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val alarmIds = prefs.getStringSet(KEY_ALARM_IDS, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
    alarmIds.remove(prayerId)
    prefs.edit()
      .putStringSet(KEY_ALARM_IDS, alarmIds)
      .remove("${KEY_PREFIX_TIME}$prayerId")
      .remove("${KEY_PREFIX_SOUND}$prayerId")
      .apply()
  }

  companion object {
    const val PREFS_NAME = "alarm_data"
    const val KEY_ALARM_IDS = "alarm_ids"
    const val KEY_PREFIX_TIME = "alarm_time_"
    const val KEY_PREFIX_SOUND = "alarm_sound_"
  }
}
