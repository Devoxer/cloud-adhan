const React = require('react')
const { View, FlatList, TextInput, ScrollView } = require('react-native')

const BottomSheetModal = React.forwardRef(({ children, onDismiss }, ref) => {
  const onDismissRef = React.useRef(onDismiss)
  onDismissRef.current = onDismiss

  React.useImperativeHandle(ref, () => ({
    present: jest.fn(),
    dismiss: jest.fn(() => {
      onDismissRef.current?.()
    }),
    snapToIndex: jest.fn(),
    snapToPosition: jest.fn(),
    expand: jest.fn(),
    collapse: jest.fn(),
    close: jest.fn(),
    forceClose: jest.fn(),
  }))
  return React.createElement(View, { testID: 'bottom-sheet-modal' }, children)
})
BottomSheetModal.displayName = 'BottomSheetModal'

const BottomSheetModalProvider = ({ children }) =>
  React.createElement(View, { testID: 'bottom-sheet-modal-provider' }, children)

const BottomSheetBackdrop = (props) =>
  React.createElement(View, { testID: 'bottom-sheet-backdrop', ...props })

const BottomSheetScrollView = ({ children, ...props }) =>
  React.createElement(ScrollView, props, children)

const BottomSheetFlatList = (props) => React.createElement(FlatList, props)

const BottomSheetTextInput = React.forwardRef((props, ref) =>
  React.createElement(TextInput, { ...props, ref }),
)
BottomSheetTextInput.displayName = 'BottomSheetTextInput'

module.exports = {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetTextInput,
  default: React.forwardRef(({ children }, _ref) =>
    React.createElement(View, { testID: 'bottom-sheet' }, children),
  ),
}
