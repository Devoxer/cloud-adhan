import { Platform, useWindowDimensions, View } from 'react-native'

type WebContainerProps = {
  children: React.ReactNode
}

export function WebContainer({ children }: WebContainerProps) {
  const { width } = useWindowDimensions()

  if (Platform.OS !== 'web' || width <= 480) {
    return <>{children}</>
  }

  return (
    <View
      testID="web-container"
      style={{ maxWidth: 480, marginHorizontal: 'auto', flex: 1, width: '100%' }}
    >
      {children}
    </View>
  )
}
