import { NativeModule, requireNativeModule } from 'expo'

declare class AlarmManagerModuleType extends NativeModule {
  scheduleAlarm(prayerId: string, timestamp: number, soundName: string): Promise<void>
  cancelAlarm(prayerId: string): Promise<void>
  cancelAllAlarms(): Promise<void>
  getScheduledAlarmCount(): Promise<number>
}

export default requireNativeModule<AlarmManagerModuleType>('AlarmManagerModule')
