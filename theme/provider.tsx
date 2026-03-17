import { createContext, useMemo, type ReactNode } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage } from '../utils/storage'
import { getThemeTokens } from './tokens'
import type {
  ResolvedTheme,
  ThemeContextValue,
  ThemePreference,
} from './types'

type ThemeStore = {
  themePreference: ThemePreference
  setThemePreference: (preference: ThemePreference) => void
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themePreference: 'dark',
      setThemePreference: (preference) => {
        Appearance.setColorScheme(
          preference === 'system' ? 'unspecified' : preference,
        )
        set({ themePreference: preference })
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          Appearance.setColorScheme(
            state.themePreference === 'system'
              ? 'unspecified'
              : state.themePreference,
          )
        }
      },
    },
  ),
)

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themePreference, setThemePreference } = useThemeStore()
  const systemColorScheme = useColorScheme()

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark'
    }
    return themePreference
  }, [themePreference, systemColorScheme])

  const tokens = useMemo(() => getThemeTokens(resolvedTheme), [resolvedTheme])

  const value: ThemeContextValue = useMemo(
    () => ({
      tokens,
      themePreference,
      setThemePreference,
      resolvedTheme,
    }),
    [tokens, themePreference, setThemePreference, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
