import * as Notifications from 'expo-notifications'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

export function useNotificationReceived(onReceived: () => void) {
  const callbackRef = useRef(onReceived)
  callbackRef.current = onReceived

  useEffect(() => {
    if (Platform.OS === 'web') return

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      callbackRef.current()
    })

    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      callbackRef.current()
    })

    return () => {
      receivedSub.remove()
      responseSub.remove()
    }
  }, [])
}
