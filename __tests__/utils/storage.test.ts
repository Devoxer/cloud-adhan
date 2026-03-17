jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>()
  return {
    createMMKV: () => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => store.set(key, value),
      remove: (key: string) => store.delete(key),
    }),
    __store: store,
  }
})

import { mmkv, mmkvStorage } from '@/utils/storage'

const { __store: store } = jest.requireMock('react-native-mmkv')

describe('utils/storage', () => {
  beforeEach(() => {
    store.clear()
  })

  describe('mmkv instance', () => {
    it('is created and exposes getString, set, remove', () => {
      expect(mmkv.getString).toBeDefined()
      expect(mmkv.set).toBeDefined()
      expect(mmkv.remove).toBeDefined()
    })
  })

  describe('mmkvStorage (Zustand StateStorage adapter)', () => {
    it('getItem returns null for missing key', () => {
      expect(mmkvStorage.getItem('missing')).toBeNull()
    })

    it('setItem stores a value retrievable by getItem', () => {
      mmkvStorage.setItem('key', 'value')
      expect(mmkvStorage.getItem('key')).toBe('value')
    })

    it('removeItem deletes the stored value', () => {
      mmkvStorage.setItem('key', 'value')
      mmkvStorage.removeItem('key')
      expect(mmkvStorage.getItem('key')).toBeNull()
    })

    it('setItem overwrites existing value', () => {
      mmkvStorage.setItem('key', 'first')
      mmkvStorage.setItem('key', 'second')
      expect(mmkvStorage.getItem('key')).toBe('second')
    })
  })
})
