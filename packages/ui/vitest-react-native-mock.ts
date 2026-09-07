export const Platform = {
  OS: 'ios',
  select: <T>(values: { ios?: T; android?: T; web?: T; default?: T }) =>
    values.ios ?? values.default,
  isTesting: true,
};

export const StyleSheet = {
  create: <T>(styles: T) => styles,
  hairlineWidth: 1,
};

export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const FlatList = 'FlatList';
export const SectionList = 'SectionList';
export const RefreshControl = 'RefreshControl';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
export const Image = 'Image';
export const TextInput = 'TextInput';
export const ActivityIndicator = 'ActivityIndicator';

export const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
  addEventListener: () => ({ remove: () => undefined }),
};

export const useWindowDimensions = () => Dimensions.get('window');
export const useColorScheme = () => 'light';
export const Keyboard = {
  dismiss: () => undefined,
  addListener: () => ({ remove: () => undefined }),
};

export default {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  SectionList,
  RefreshControl,
  KeyboardAvoidingView,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Keyboard,
};
