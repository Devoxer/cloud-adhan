import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { SettingsSection } from '@/components/settings/SettingsSection'

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      typography: {
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
      },
      radii: { sm: 8, md: 12 },
    },
  })),
}))

describe('components/settings/SettingsSection', () => {
  it('renders section header text', () => {
    render(
      <SettingsSection title="Prayer">
        <Text>Child content</Text>
      </SettingsSection>,
    )

    expect(screen.getByText('Prayer')).toBeTruthy()
  })

  it('renders header with accessibility role', () => {
    render(
      <SettingsSection title="Notifications">
        <Text>Child content</Text>
      </SettingsSection>,
    )

    expect(screen.getByRole('header')).toBeTruthy()
  })

  it('renders children inside Surface', () => {
    render(
      <SettingsSection title="About">
        <Text>Version info</Text>
        <Text>License info</Text>
      </SettingsSection>,
    )

    expect(screen.getByText('Version info')).toBeTruthy()
    expect(screen.getByText('License info')).toBeTruthy()
  })
})
