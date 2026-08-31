// Mock window.matchMedia
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill XMLHttpRequest to prevent isomorphic-webcrypto/msrcrypto from throwing ReferenceError in Node environments
(global as any).XMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '',
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const dummyAnimation = {
    duration: () => dummyAnimation,
    delay: () => dummyAnimation,
    springify: () => dummyAnimation,
    damping: () => dummyAnimation,
    mass: () => dummyAnimation,
    stiffness: () => dummyAnimation,
    overshootClamping: () => dummyAnimation,
    restDisplacementThreshold: () => dummyAnimation,
    restSpeedThreshold: () => dummyAnimation,
  };
  const mockReanimated = {
    default: {
      call: jest.fn(),
    },
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (fn: any) => fn() || {},
    useAnimatedProps: (fn: any) => fn() || {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
    withTiming: (toValue: any, _, cb: any) => {
      if (cb) cb(true);
      return toValue;
    },
    withSpring: (toValue: any, _, cb: any) => {
      if (cb) cb(true);
      return toValue;
    },
    withSequence: (...args: any[]) => args[args.length - 1],
    withRepeat: (animation: any, numberOfReps: number, reverse?: boolean) => animation,
    cancelAnimation: jest.fn(),
    createAnimatedComponent: (Component: any) => Component,
    interpolate: (val: number, input: number[], output: number[]) => output[0],
    Extrapolate: { CLAMP: 'clamp' },
    FadeIn: dummyAnimation,
    FadeOut: dummyAnimation,
    FadeInUp: dummyAnimation,
    FadeOutUp: dummyAnimation,
    SlideInDown: dummyAnimation,
    SlideOutDown: dummyAnimation,
    ZoomIn: dummyAnimation,
    ZoomOut: dummyAnimation,
    Layout: dummyAnimation,
    Easing: {
      linear: (t: number) => t,
      ease: (t: number) => t,
      in: (fn: any) => fn,
      out: (fn: any) => fn,
      inOut: (fn: any) => fn,
      bezier: () => (t: number) => t,
    },
    View: require('react-native').View,
    Text: require('react-native').Text,
    ScrollView: require('react-native').ScrollView,
    Image: require('react-native').Image,
  };
  Object.assign(mockReanimated.default, mockReanimated);
  return mockReanimated;
});

// Mock Worklets (required by Reanimated v4 in test environments)
jest.mock('react-native-worklets', () => ({
  createSerializable: (val: any) => val,
  Worklets: {
    createRunInJSFn: (fn: any) => fn,
    createRunInContextFn: (fn: any) => fn,
  },
}));

// Mock Skia
jest.mock('@shopify/react-native-skia', () => ({
  // stub implementation
}));

// Mock Sentry
jest.mock(
  '@sentry/react-native',
  () => ({
    init: jest.fn(),
    captureException: jest.fn(),
  }),
  { virtual: true },
);

// Mock react-native-external-keyboard (used by FocusRing)
jest.mock('react-native-external-keyboard', () => {
  const React = require('react');
  return {
    K: {
      Pressable: React.forwardRef((props: any, ref: any) =>
        React.createElement('Pressable', { ...props, ref }),
      ),
    },
    Keyboard: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
    },
    useKeyboardHandler: jest.fn(() => {}),
  };
});

// Mock react-native-fast-confetti (used by CelebrationOverlay)
jest.mock('react-native-fast-confetti', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) =>
      React.createElement('Confetti', { ...props, ref }),
    ),
    Confetti: React.forwardRef((props: any, ref: any) =>
      React.createElement('Confetti', { ...props, ref }),
    ),
  };
});
