import { render, screen } from '@testing-library/react-native'
import { Platform, View } from 'react-native'

import { WebContainer } from '@/components/ui/WebContainer'

// Mock useWindowDimensions from react-native
let mockWidth = 1024
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 768, scale: 1, fontScale: 1 }),
}))

const originalPlatformOS = Platform.OS

describe('components/ui/WebContainer', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('renders children without wrapper when Platform.OS is not web', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
    mockWidth = 1024

    const { toJSON } = render(
      <WebContainer>
        <View testID="child" />
      </WebContainer>,
    )

    const tree = toJSON()
    // On native, WebContainer returns a fragment wrapping children — no View with maxWidth
    expect(tree).toBeTruthy()
    const json = tree as { props?: { style?: Record<string, unknown> } }
    expect(json.props?.style).toBeUndefined()
  })

  it('applies maxWidth 480 on web when window width > 480', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
    mockWidth = 1024

    render(
      <WebContainer>
        <View testID="child" />
      </WebContainer>,
    )

    const wrapper = screen.getByTestId('web-container')
    expect(wrapper).toBeTruthy()
    expect(wrapper.props.style).toEqual(
      expect.objectContaining({
        maxWidth: 480,
        flex: 1,
        width: '100%',
      }),
    )
  })

  it('renders full-width on web when window width <= 480', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
    mockWidth = 375

    const { toJSON } = render(
      <WebContainer>
        <View testID="child" />
      </WebContainer>,
    )

    const tree = toJSON()
    const json = tree as { props?: { style?: Record<string, unknown> } }
    expect(json.props?.style).toBeUndefined()
  })
})
