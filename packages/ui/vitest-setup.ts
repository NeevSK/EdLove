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
