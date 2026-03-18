import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { forwardRef, type ReactNode, type Ref, useCallback, useMemo } from 'react'
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/hooks/useTheme'

type BottomSheetProps = {
  children: ReactNode
  snapPoints?: (string | number)[]
  title?: string
  onDismiss?: () => void
  scrollable?: boolean
}

export const BottomSheet = forwardRef(function BottomSheet(
  { children, snapPoints = ['50%'], title, onDismiss, scrollable = true }: BottomSheetProps,
  ref: Ref<BottomSheetModal>,
) {
  const { tokens } = useTheme()

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        accessibilityElementsHidden={Platform.OS === 'ios'}
        importantForAccessibility={Platform.OS === 'android' ? 'no-hide-descendants' : undefined}
      />
    ),
    [],
  )

  const handleAnimate = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === -1 && toIndex >= 0 && title) {
        AccessibilityInfo.announceForAccessibility(`${title} opened`)
      } else if (fromIndex >= 0 && toIndex === -1 && title) {
        AccessibilityInfo.announceForAccessibility(`${title} closed`)
      }
    },
    [title],
  )

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: tokens.colors.surface,
      borderTopStartRadius: tokens.radii.lg,
      borderTopEndRadius: tokens.radii.lg,
    }),
    [tokens],
  )

  const handleIndicatorStyle = useMemo(
    () => ({
      backgroundColor: tokens.colors.textTertiary,
    }),
    [tokens],
  )

  const styles = useMemo(
    () =>
      StyleSheet.create({
        titleContainer: {
          paddingHorizontal: tokens.spacing.md,
          paddingTop: tokens.spacing.md,
          paddingBottom: tokens.spacing.sm,
          alignItems: 'center',
        },
        contentContainer: {
          paddingHorizontal: tokens.spacing.md,
          paddingBottom: tokens.spacing.lg,
        },
        contentFlex: {
          flex: 1,
        },
      }),
    [tokens],
  )

  const titleElement = title ? (
    <View style={styles.titleContainer}>
      <AppText variant="h3">{title}</AppText>
    </View>
  ) : null

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      handleIndicatorStyle={handleIndicatorStyle}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      onAnimate={handleAnimate}
      accessible
      accessibilityViewIsModal
    >
      {scrollable ? (
        <BottomSheetScrollView>
          {titleElement}
          <View style={styles.contentContainer}>{children}</View>
        </BottomSheetScrollView>
      ) : (
        <>
          {titleElement}
          <View style={[styles.contentContainer, styles.contentFlex]}>{children}</View>
        </>
      )}
    </BottomSheetModal>
  )
})
