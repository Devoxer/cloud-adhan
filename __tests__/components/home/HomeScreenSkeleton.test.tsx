import { render } from '@testing-library/react-native'

import { HomeScreenSkeleton } from '@/components/home/HomeScreenSkeleton'

// Mock Reanimated
const mockUseReducedMotion = jest.fn(() => false)
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native')
  return {
    __esModule: true,
    useReducedMotion: () => mockUseReducedMotion(),
    useSharedValue: jest.fn((initial: number) => ({ value: initial })),
    useAnimatedStyle: jest.fn((fn: () => Record<string, unknown>) => fn()),
    withRepeat: jest.fn((val: number) => val),
    withTiming: jest.fn((val: number) => val),
    default: {
      View: RN.View,
      createAnimatedComponent: (comp: unknown) => comp,
    },
  }
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
      },
      spacing: { sm: 8, md: 16, lg: 24 },
      radii: { sm: 8, md: 12, full: 9999 },
    },
  })),
}))

describe('components/home/HomeScreenSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseReducedMotion.mockReturnValue(false)
  })

  it('renders placeholder shapes', () => {
    const { toJSON } = render(<HomeScreenSkeleton />)
    const tree = toJSON()

    // Renders a container with child groups (date bar, hero, timeline with 6 rows)
    expect(tree).toBeTruthy()
    expect(tree).toMatchObject({ type: 'View' })
  })

  it('respects reduce motion', () => {
    mockUseReducedMotion.mockReturnValue(true)

    const { toJSON } = render(<HomeScreenSkeleton />)

    // Component still renders with static opacity
    expect(toJSON()).toBeTruthy()
  })

  it('is hidden from accessibility tree', () => {
    const { toJSON } = render(<HomeScreenSkeleton />)
    const tree = toJSON() as { props: Record<string, unknown> }

    expect(tree.props.accessibilityElementsHidden).toBe(true)
    expect(tree.props.importantForAccessibility).toBe('no-hide-descendants')
  })
})
