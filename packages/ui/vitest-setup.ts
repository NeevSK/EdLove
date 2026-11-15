import { vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

vi.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 0, Medium: 1, Heavy: 2 },
  NotificationFeedbackType: { Success: 0, Warning: 1, Error: 2 },
  impactAsync: vi.fn(async () => undefined),
  notificationAsync: vi.fn(async () => undefined),
  selectionAsync: vi.fn(async () => undefined),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.assign(globalThis, {
  XMLHttpRequest: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    send: vi.fn(),
    readyState: 4,
    status: 200,
    responseText: '',
  })),
});

vi.mock('react-native-worklets', () => ({
  createSerializable: (value: unknown) => value,
  Worklets: {
    createRunInJSFn: (factory: unknown) => factory,
    createRunInContextFn: (factory: unknown) => factory,
  },
}));

vi.mock('react-native-skia', () => ({}));
vi.mock('@sentry/react-native', () => ({ init: vi.fn(), captureException: vi.fn() }));
// The keyboard library binds native views at import; tests get plain stand-ins for what the kit uses.
vi.mock('react-native-keyboard-controller', async () => {
  const RN = await import('react-native');
  const pass = ({ children }: { children?: unknown }) => children ?? null;
  const Toolbar = Object.assign(pass, {
    Prev: () => null,
    Next: () => null,
    Done: () => null,
    Content: pass,
    Background: pass,
    Group: pass,
  });
  return {
    KeyboardProvider: pass,
    KeyboardToolbar: Toolbar,
    KeyboardAwareScrollView: RN.ScrollView,
    KeyboardAvoidingView: RN.View,
    KeyboardStickyView: RN.View,
    useKeyboardState: () => ({ isVisible: false, height: 0 }),
  };
});

vi.mock('react-native-external-keyboard', () => {
  const React = require('react');
  return {
    K: {
      Pressable: ({ ref, ...props }: Record<string, unknown> & { ref?: unknown }) =>
        React.createElement('Pressable', { ...props, ref }),
    },
    Keyboard: {
      addListener: vi.fn(() => ({ remove: vi.fn() })),
      removeListener: vi.fn(),
    },
    useKeyboardHandler: vi.fn(() => undefined),
  };
});

vi.mock('react-native-fast-confetti', () => {
  const React = require('react');
  const Confetti = ({ ref, ...props }: Record<string, unknown> & { ref?: unknown }) =>
    React.createElement('Confetti', { ...props, ref });
  return { __esModule: true, default: Confetti, Confetti };
});

vi.mock('react-native-gesture-handler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-native-gesture-handler')>();
  const createChainable = () => {
    const chain: Record<string, unknown> = {};
    const proxy: unknown = new Proxy(chain, {
      get: (_target, prop) => {
        if (prop === 'then') return undefined;
        if (!chain[prop as string]) {
          chain[prop as string] = vi.fn().mockReturnValue(proxy);
        }
        return chain[prop as string];
      },
    });
    return proxy;
  };

  return {
    ...actual,
    Gesture: {
      ...actual.Gesture,
      Pan: vi.fn(() => createChainable()),
      Tap: vi.fn(() => createChainable()),
      LongPress: vi.fn(() => createChainable()),
      Pinch: vi.fn(() => createChainable()),
      Rotation: vi.fn(() => createChainable()),
      Fling: vi.fn(() => createChainable()),
    },
    usePanGesture: vi.fn((config: unknown) => config),
  };
});

// vitest-native's reanimated preset has no `interpolateColor` (living light in
// the kit). Substitute one that lands on the end colour, as a finished timing does.
vi.mock('react-native-reanimated', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  interpolateColor: (value: number, input: readonly number[], output: readonly string[]) =>
    output[value >= (input.at(-1) ?? 1) ? output.length - 1 : 0],
}));
