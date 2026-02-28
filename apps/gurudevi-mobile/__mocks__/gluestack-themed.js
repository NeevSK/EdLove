// Manual mock for @gluestack-ui/themed and all its build/components/* sub-paths.
//
// Use HOST STRING TYPES ('View', 'Text', etc.) instead of ReactNative.* components.
//
// Why: @testing-library/react-native v14 uses test-renderer@0.14.0, a custom React
// reconciler. When jest-expo/web maps react-native → react-native-web, any call to
// ReactNative.View renders through react-native-web's function chain, eventually
// producing a DOM 'div' host element. The test-renderer then sees 'div' as the parent
// of text strings, violating its "text must be inside a Text host" invariant
// (textComponentTypes = ['Text', 'RCTText']).
//
// By using literal strings 'View' and 'Text', the test-renderer treats them as opaque
// host elements it manages directly—no react-native-web translation happens.
const React = require('react');

// Host element helpers — testID flows through for getAllByTestId / getByTestId queries
const mkView = (extraProps) => ({ testID, children, style, ...rest }) =>
    React.createElement('View', { testID, ...(extraProps || {}) }, children);

const mkText = () => ({ testID, children, ...rest }) =>
    React.createElement('Text', { testID }, children);

const noop = () => null;

const View = mkView();
const Text = mkText();
const TextInput = ({ testID, ...p }) =>
    React.createElement('TextInput', { testID });

module.exports = {
    // Layout
    Box: View, Center: View, HStack: View, VStack: View, View, Divider: View,
    ScrollView: View, FlatList: View, SectionList: View,
    // Typography
    Text, Heading: Text, Badge: Text, BadgeText: Text,
    // Interactive
    Button: View, ButtonText: Text, ButtonIcon: noop,
    Pressable: View, Icon: noop,
    // Form
    Input: View, InputField: TextInput,
    Select: View, SelectTrigger: View, SelectInput: View, SelectIcon: noop,
    SelectPortal: View, SelectBackdrop: View, SelectContent: View,
    SelectDragIndicatorWrapper: View, SelectDragIndicator: View, SelectItem: View,
    Checkbox: View, CheckboxIndicator: View, CheckboxIcon: noop, CheckboxLabel: Text,
    // Feedback
    Spinner: View,
    useToast: () => ({ show: jest.fn() }),
    Toast: View, ToastTitle: Text, ToastDescription: Text,
    // Provider
    GluestackUIProvider: ({ children }) => children,
    // Icons
    CheckIcon: noop, ChevronDownIcon: noop, CloseIcon: noop, InfoIcon: noop,
    // Modal / Overlay
    Modal: View, ModalBackdrop: View, ModalContent: View, ModalHeader: View,
    ModalBody: View, ModalFooter: View, ModalCloseButton: View,
    // Image
    Image: View,
    // Misc
    Avatar: View, AvatarFallbackText: Text, AvatarImage: View,
    default: {},
};
