import { Platform } from 'react-native'

export function getDeviceManufacturer(): string | null {
  if (Platform.OS !== 'android') return null
  const manufacturer = (Platform.constants as Record<string, unknown>)?.Manufacturer
  return typeof manufacturer === 'string' ? manufacturer.toLowerCase() : null
}

export function isAndroid(): boolean {
  return Platform.OS === 'android'
}
