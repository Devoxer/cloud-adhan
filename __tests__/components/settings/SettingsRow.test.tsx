import { fireEvent, render, screen } from '@testing-library/react-native'

import { SettingsRow } from '@/components/settings/SettingsRow'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      typography: {
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
      },
      radii: { sm: 8, md: 12 },
    },
  })),
}))

// Mock expo-haptics (used by Toggle)
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}))

describe('components/settings/SettingsRow', () => {
  it('renders label for toggle variant', () => {
    render(
      <SettingsRow
        variant="toggle"
        label="Fajr"
        toggleValue={true}
        onToggleChange={jest.fn()}
        accessibilityLabel="Fajr"
      />,
    )

    expect(screen.getByText('Fajr')).toBeTruthy()
  })

  it('renders Toggle component for toggle variant', () => {
    render(
      <SettingsRow
        variant="toggle"
        label="Fajr"
        toggleValue={true}
        onToggleChange={jest.fn()}
        accessibilityLabel="Fajr"
      />,
    )

    const toggle = screen.getByRole('switch')
    expect(toggle).toBeTruthy()
    expect(toggle.props.accessibilityState).toMatchObject({ checked: true })
  })

  it('calls onToggleChange when toggle is pressed', () => {
    const onToggleChange = jest.fn()
    render(
      <SettingsRow
        variant="toggle"
        label="Fajr"
        toggleValue={false}
        onToggleChange={onToggleChange}
        accessibilityLabel="Fajr"
      />,
    )

    fireEvent.press(screen.getByRole('switch'))
    expect(onToggleChange).toHaveBeenCalledWith(true)
  })

  it('renders label for navigation variant', () => {
    render(
      <SettingsRow
        variant="navigation"
        label="Calculation Method"
        value="ISNA"
        accessibilityLabel="Calculation Method, ISNA"
      />,
    )

    expect(screen.getByText('Calculation Method')).toBeTruthy()
  })

  it('renders value text for navigation variant', () => {
    render(
      <SettingsRow
        variant="navigation"
        label="Calculation Method"
        value="ISNA"
        accessibilityLabel="Calculation Method, ISNA"
      />,
    )

    expect(screen.getByText('ISNA')).toBeTruthy()
  })

  it('has button accessibility role for navigation variant', () => {
    render(
      <SettingsRow
        variant="navigation"
        label="Theme"
        accessibilityLabel="Theme"
      />,
    )

    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('calls onPress for navigation variant', () => {
    const onPress = jest.fn()
    render(
      <SettingsRow
        variant="navigation"
        label="Theme"
        onPress={onPress}
        accessibilityLabel="Theme"
      />,
    )

    fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders label for value variant', () => {
    render(
      <SettingsRow
        variant="value"
        label="Version"
        value="1.0.0"
        accessibilityLabel="Version 1.0.0"
      />,
    )

    expect(screen.getByText('Version')).toBeTruthy()
    expect(screen.getByText('1.0.0')).toBeTruthy()
  })

  it('calls onPress for value variant when tappable', () => {
    const onPress = jest.fn()
    render(
      <SettingsRow
        variant="value"
        label="Open Source"
        onPress={onPress}
        accessibilityLabel="Open Source"
      />,
    )

    fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('has accessibility label on toggle variant (via Toggle)', () => {
    render(
      <SettingsRow
        variant="toggle"
        label="Fajr"
        toggleValue={true}
        onToggleChange={jest.fn()}
        accessibilityLabel="Fajr notifications"
      />,
    )
    // Toggle component carries the accessibilityLabel
    expect(screen.getByLabelText('Fajr notifications')).toBeTruthy()
  })

  it('has accessibility label on navigation variant', () => {
    render(
      <SettingsRow
        variant="navigation"
        label="Theme"
        accessibilityLabel="Theme setting"
      />,
    )
    expect(screen.getByLabelText('Theme setting')).toBeTruthy()
  })

  it('has accessibility label on value variant', () => {
    render(
      <SettingsRow
        variant="value"
        label="Version"
        accessibilityLabel="App version"
      />,
    )
    expect(screen.getByLabelText('App version')).toBeTruthy()
  })
})
