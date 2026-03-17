import { Platform } from 'react-native'

import { getDeviceManufacturer, isAndroid } from '@/utils/platform'

describe('utils/platform', () => {
  const originalOS = Platform.OS
  const originalConstants = Platform.constants

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
    Object.defineProperty(Platform, 'constants', {
      value: originalConstants,
      configurable: true,
    })
  })

  describe('getDeviceManufacturer', () => {
    it('returns null on iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      expect(getDeviceManufacturer()).toBeNull()
    })

    it('returns null on web', () => {
      Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
      expect(getDeviceManufacturer()).toBeNull()
    })

    it('returns lowercase manufacturer on Android', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
      Object.defineProperty(Platform, 'constants', {
        value: { Manufacturer: 'Samsung' },
        configurable: true,
      })
      expect(getDeviceManufacturer()).toBe('samsung')
    })

    it('returns null if Manufacturer is undefined on Android', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
      Object.defineProperty(Platform, 'constants', {
        value: {},
        configurable: true,
      })
      expect(getDeviceManufacturer()).toBeNull()
    })

    it('normalizes various manufacturer names to lowercase', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })

      const manufacturers = ['XIAOMI', 'Huawei', 'OnePlus', 'OPPO', 'vivo']
      for (const name of manufacturers) {
        Object.defineProperty(Platform, 'constants', {
          value: { Manufacturer: name },
          configurable: true,
        })
        expect(getDeviceManufacturer()).toBe(name.toLowerCase())
      }
    })
  })

  describe('isAndroid', () => {
    it('returns true on Android', () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
      expect(isAndroid()).toBe(true)
    })

    it('returns false on iOS', () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      expect(isAndroid()).toBe(false)
    })

    it('returns false on web', () => {
      Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
      expect(isAndroid()).toBe(false)
    })
  })
})
