package expo.modules.alarmmanager

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val prayerId = intent.getStringExtra("prayerId") ?: return
    val soundName = intent.getStringExtra("soundName") ?: "makkah"

    val serviceIntent = Intent(context, AthanService::class.java).apply {
      putExtra("prayerId", prayerId)
      putExtra("soundName", soundName)
    }
    ContextCompat.startForegroundService(context, serviceIntent)
  }
}
