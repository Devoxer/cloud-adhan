import type {
  ColorTokens,
  RadiiTokens,
  ResolvedTheme,
  SpacingTokens,
  ThemeTokens,
  TypographyTokens,
} from './types'

const darkColors: ColorTokens = {
  background: '#000000',
  surface: '#1A1614',
  surfaceElevated: '#2A2420',
  textPrimary: '#F5F0E8',
  textSecondary: '#A89F94',
  textTertiary: '#6B6158',
  accent: '#C4A34D',
  accentSubtle: 'rgba(196, 163, 77, 0.15)',
  teal: '#5B9A8B',
  error: '#E85D4A',
  warning: '#E8A84A',
  border: '#2A2420',
  prayerActive: '#C4A34D',
  prayerPassed: '#6B6158',
  prayerCurrent: '#5B9A8B',
  fajrSpecial: '#7B9ACC',
  qiblaDirection: '#5B9A8B',
  notificationOn: '#5B9A8B',
  notificationOff: '#6B6158',
  onAccent: '#FFFFFF',
}

const lightColors: ColorTokens = {
  background: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceElevated: '#F0EDE8',
  textPrimary: '#1A1614',
  textSecondary: '#6B6158',
  textTertiary: '#A89F94',
  accent: '#8B7332',
  accentSubtle: 'rgba(139, 115, 50, 0.12)',
  teal: '#3D7A6B',
  error: '#D04A3A',
  warning: '#C48A30',
  border: '#E0DDD8',
  prayerActive: '#8B7332',
  prayerPassed: '#A89F94',
  prayerCurrent: '#3D7A6B',
  fajrSpecial: '#4A6B99',
  qiblaDirection: '#3D7A6B',
  notificationOn: '#3D7A6B',
  notificationOff: '#A89F94',
  onAccent: '#FFFFFF',
}

const spacing: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}

const typography: TypographyTokens = {
  countdownLarge: { size: 56, weight: '300', lineHeight: 1.1 },
  countdownUnit: { size: 20, weight: '400', lineHeight: 1.2 },
  h1: { size: 28, weight: '600', lineHeight: 1.3 },
  h2: { size: 22, weight: '600', lineHeight: 1.3 },
  h3: { size: 18, weight: '600', lineHeight: 1.4 },
  body: { size: 16, weight: '400', lineHeight: 1.5 },
  bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
  caption: { size: 12, weight: '400', lineHeight: 1.4 },
  label: { size: 14, weight: '500', lineHeight: 1.2 },
}

const radii: RadiiTokens = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}

const colorsByTheme: Record<ResolvedTheme, ColorTokens> = {
  dark: darkColors,
  light: lightColors,
}

export function getThemeTokens(theme: ResolvedTheme): ThemeTokens {
  return {
    colors: colorsByTheme[theme],
    spacing,
    typography,
    radii,
  }
}
