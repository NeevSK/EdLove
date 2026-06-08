import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';

// \u2500\u2500 Environment variables required by supabase.ts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Must be set BEFORE any module is required (setupFilesAfterEnv runs before imports)
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';

// Mock expo-constants with ALL required exports
jest.mock('expo-constants', () => {
  return {
    default: {
      executionEnvironment: 'storeClient',
      expoConfig: {
        extra: {
          supabaseUrl: 'https://test.supabase.co',
          supabasePublishableKey: 'test-key',
        },
      },
    },
    executionEnvironment: 'storeClient',
    ExecutionEnvironment: {
      StoreClient: 'storeClient',
      Standalone: 'standalone',
    },
  };
});

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn().mockReturnValue(undefined),
      getNumber: jest.fn().mockReturnValue(undefined),
      getBoolean: jest.fn().mockReturnValue(undefined),
      delete: jest.fn(),
      clearAll: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
    })),
  };
});

// Mock react-native-nitro-modules (peer dep of react-native-mmkv v4)
jest.mock('react-native-nitro-modules', () => ({}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

// @gluestack-ui/themed and all sub-paths are handled by moduleNameMapper in jest.config.js
// (maps '^@gluestack-ui/themed(.*)$' \u2192 '__mocks__/gluestack-themed.js').
// The manual mock uses host string types ('View', 'Text') that test-renderer@0.14.0
// can process without going through the react-native-web rendering chain.

// Mock expo-camera per Worker issue
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: { back: 'back', front: 'front' },
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn().mockResolvedValue(undefined),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock i18next singleton (used directly as `i18n.language` in some components)
jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  isInitialized: true,
}));

// react-native-reanimated and react-native-worklets are mocked via moduleNameMapper
// in jest.config.js (they require C++ JSI + Worklets native build which can't run in Jest)

// Mock @repo/ui \u2014 fully self-contained (NO jest.requireActual).
//
// WHY no requireActual: requireActual bypasses moduleNameMapper, so gluestack sub-paths
// like '@gluestack-ui/themed/build/components/Box' load their real ESM/native code and
// return undefined in Jest's CJS environment.
//
// ProgressIndicator is inlined here so ProgressIndicator.test.tsx still exercises its
// dot-rendering and step-count logic via host string elements ('View', 'Text').
jest.mock('@repo/ui', () => {
  const React = require('react');
  // Host-element wrappers: test-renderer@0.14.0 checks text must be inside 'Text' type
  const V = ({ testID, children, ...p }: any) => React.createElement('View', { testID }, children);
  const T = ({ testID, children, ...p }: any) => React.createElement('Text', { testID }, children);
  const noop = () => null;
  const corners = {
    small: 8,
    medium: 16,
    large: 24,
    tight: 8,
    comfortable: 16,
    generous: 24,
    full: 9999,
  };

  return {
    // \u2500\u2500 Gluestack layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Box: V,
    VStack: V,
    HStack: V,
    Center: V,
    View: V,
    Divider: V,
    ScrollView: V,
    FlatList: V,
    // \u2500\u2500 Typography \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Text: T,
    Heading: T,
    Badge: T,
    BadgeText: T,
    ButtonText: T,
    ToastTitle: T,
    LinkText: T,
    // \u2500\u2500 Interactive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Button: ({ testID, children, onPress, isDisabled, ...p }: any) =>
      React.createElement('View', { testID, onPress, isDisabled }, children),
    Pressable: ({ testID, children, onPress, ...p }: any) =>
      React.createElement('View', { testID, onPress }, children),
    Link: ({ testID, children, onPress, ...p }: any) =>
      React.createElement('View', { testID, onPress }, children),
    // \u2500\u2500 Form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Input: V,
    InputField: ({ testID, placeholder, value, onChangeText, ...p }: any) =>
      React.createElement('TextInput', {
        testID,
        placeholder,
        value,
        onChangeText,
      }),
    // \u2500\u2500 Checkbox \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Checkbox: V,
    CheckboxIndicator: V,
    CheckboxIcon: noop,
    CheckboxLabel: T,
    CheckIcon: noop,
    // \u2500\u2500 Select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Select: V,
    SelectTrigger: V,
    SelectInput: V,
    SelectIcon: noop,
    SelectPortal: V,
    SelectBackdrop: V,
    SelectContent: V,
    SelectDragIndicatorWrapper: V,
    SelectDragIndicator: V,
    SelectItem: V,
    // \u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Toast: V,
    useToast: jest.fn(() => ({ show: jest.fn() })),
    // \u2500\u2500 Wrapper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    ScreenWrapper: ({ children }: any) => React.createElement(React.Fragment, null, children),
    EnvironmentProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    ExternalLinkProvider: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
    openExternalURL: jest.fn().mockResolvedValue(true),
    showExternalLinkOptions: jest.fn().mockResolvedValue(true),
    // \u2500\u2500 ProgressIndicator (inlined for ProgressIndicator.test.tsx) \u2500\u2500\u2500\u2500\u2500\u2500\u2500
    ProgressIndicator: ({ currentStep, totalSteps, showStepCount = true }: any) => {
      const dots = Array.from({ length: totalSteps }, (_: any, i: number) =>
        React.createElement('View', {
          key: i,
          testID: `progress-dot-${i}`,
          sx: { width: i === currentStep ? 24 : 8 },
        }),
      );
      return React.createElement(
        'View',
        {},
        React.createElement('View', {}, ...dots),
        showStepCount
          ? React.createElement('Text', {}, `Step ${currentStep + 1} of ${totalSteps}`)
          : null,
      );
    },
    // \u2500\u2500 Hooks \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    useThemedColors: jest.fn(() => ({
      background: '#fff',
      text: '#000',
      primary: '#D4AF37',
      action: '#D4AF37',
      textSecondary: '#666',
      textTertiary: '#999',
      border: '#eee',
      surface: '#f8f8f8',
      error: '#ff4444',
    })),
    useEnvironment: jest.fn(() => ({
      theme: 'light',
      isDark: false,
      colors: { background: '#fff', text: '#000', primary: '#D4AF37' },
      temporalPhase: 'morning',
      deviceTier: 'standard',
      networkQuality: 'good',
    })),
    // \u2500\u2500 Haptics \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    hapticLight: jest.fn(),
    hapticSuccess: jest.fn(),
    hapticError: jest.fn(),
    // \u2500\u2500 Theme \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    Theme: {
      corners,
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      colors: {
        sacredWhite: '#FFFFFF',
        deepNight: '#1a1a2e',
        goldAccent: '#D4AF37',
      },
      typography: {},
      deviceTier: 'standard',
    },
    typography: {},
  };
});

// Mock EnvironmentContext and useThemedColors at source level so components
// loaded via moduleNameMapper (@repo/ui \u2192 packages/ui/src/index.ts) get the mock.
// Using __dirname template literals avoids jest.mock() hoisting issues since
// __dirname is a CJS module constant (always available), not a declared variable.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock(`${__dirname}/../../packages/ui/src/context/EnvironmentContext`, () => {
  const defaultEnv = {
    theme: 'light',
    isDark: false,
    colors: {
      background: '#fff',
      surface: '#f8f8f8',
      surfaceElevated: '#f0f0f0',
      text: '#1a1a1a',
      textSecondary: '#666',
      textTertiary: '#999',
      primary: '#D4AF37',
      action: '#D4AF37',
      border: '#eee',
      error: '#ff4444',
    },
    temporalPhase: 'morning',
    deviceTier: 'standard',
    networkQuality: 'good',
    isOnline: true,
    language: 'en',
  };
  return {
    EnvironmentProvider: ({ children }: any) => children,
    useEnvironment: jest.fn(() => defaultEnv),
    getTemporalPhase: jest.fn(() => 'morning'),
    shouldUseDarkTheme: jest.fn(() => false),
  };
});

jest.mock(`${__dirname}/../../packages/ui/src/hooks/useThemedColors`, () => ({
  useThemedColors: jest.fn(() => ({
    background: '#fff',
    surface: '#f8f8f8',
    text: '#1a1a1a',
    textSecondary: '#666',
    textTertiary: '#999',
    primary: '#D4AF37',
    action: '#D4AF37',
    border: '#eee',
    error: '#ff4444',
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
}));

// Mock native modules that use ESM builds and can't run in Jest jsdom environment
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Test',
  modelName: 'Test Device',
  osName: 'Android',
  osVersion: '13',
  deviceType: 1,
  DeviceType: { PHONE: 1, TABLET: 2 },
}));

jest.mock('expo-modules-core', () => ({
  UnavailabilityError: class UnavailabilityError extends Error {},
  requireNativeModule: jest.fn().mockReturnValue({}),
  requireOptionalNativeModule: jest.fn().mockReturnValue(null),
  requireNativeViewManager: jest.fn().mockReturnValue('View'),
  NativeModulesProxy: {},
  EventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
  })),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, type: 'wifi' }),
  useNetInfo: jest.fn(() => ({ isConnected: true, type: 'wifi' })),
}));

// react-native-safe-area-context: useSafeAreaInsets requires SafeAreaProvider at root
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
    SafeAreaProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children, ...p }: any) => React.createElement('View', p, children),
    initialWindowMetrics: {
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
      frame: { x: 0, y: 0, width: 375, height: 812 },
    },
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  const Icon = (props: any) => React.createElement(ReactNative.View, props);
  return new Proxy(
    {},
    {
      get: (_target, key) => {
        if (key === '__esModule') return true;
        return Icon;
      },
    },
  );
});
