export type ThemePreference = 'dark' | 'light' | 'system'

export type ResolvedTheme = 'dark' | 'light'

export type ColorTokens = {
  background: string
  surface: string
  surfaceElevated: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  accent: string
  accentSubtle: string
  teal: string
  error: string
  warning: string
  border: string
  prayerActive: string
  prayerPassed: string
  prayerCurrent: string
  fajrSpecial: string
  qiblaDirection: string
  notificationOn: string
  notificationOff: string
  onAccent: string
}

export type SpacingTokens = {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export type TypographyToken = {
  size: number
  weight: '300' | '400' | '500' | '600'
  lineHeight: number
}

export type TypographyTokens = {
  countdownLarge: TypographyToken
  countdownUnit: TypographyToken
  h1: TypographyToken
  h2: TypographyToken
  h3: TypographyToken
  body: TypographyToken
  bodySmall: TypographyToken
  caption: TypographyToken
  label: TypographyToken
}

export type RadiiTokens = {
  sm: number
  md: number
  lg: number
  full: number
}

export type ThemeTokens = {
  colors: ColorTokens
  spacing: SpacingTokens
  typography: TypographyTokens
  radii: RadiiTokens
}

export type ThemeContextValue = {
  tokens: ThemeTokens
  themePreference: ThemePreference
  setThemePreference: (preference: ThemePreference) => void
  resolvedTheme: ResolvedTheme
}
