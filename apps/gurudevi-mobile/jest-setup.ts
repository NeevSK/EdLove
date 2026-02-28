import React from 'react';
import '@testing-library/jest-dom';
import 'react-native-gesture-handler/jestSetup';

// ── Environment variables required by supabase.ts ────────────────────────────
// Must be set BEFORE any module is required (setupFilesAfterEnv runs before imports)
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock expo-constants with ALL required exports
jest.mock('expo-constants', () => {
    return {
        default: {
            executionEnvironment: 'storeClient',
            expoConfig: {
                extra: {
                    supabaseUrl: 'https://test.supabase.co',
                    supabaseAnonKey: 'test-key',
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
// (maps '^@gluestack-ui/themed(.*)$' → '__mocks__/gluestack-themed.js').
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
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// react-native-reanimated and react-native-worklets are mocked via moduleNameMapper
// in jest.config.js (they require C++ JSI + Worklets native build which can't run in Jest)

// Mock @repo/ui context hooks to avoid EnvironmentProvider requirement in tests.
// Components that use useEnvironment/useThemedColors don't need a real provider.
jest.mock('@repo/ui', () => {
    const actual = jest.requireActual('@repo/ui');
    return {
        ...actual,
        useEnvironment: jest.fn(() => ({
            theme: 'light',
            isDark: false,
            colors: { background: '#fff', text: '#000', primary: '#D4AF37' },
            temporalPhase: 'morning',
            deviceTier: 'standard',
            networkQuality: 'good',
        })),
        useThemedColors: jest.fn(() => ({
            background: '#fff', text: '#000', primary: '#D4AF37',
            action: '#D4AF37', textSecondary: '#666', textTertiary: '#999',
            border: '#eee', surface: '#f8f8f8', error: '#ff4444',
        })),
        EnvironmentProvider: ({ children }: { children: React.ReactNode }) => children,
    };
});

// Mock EnvironmentContext and useThemedColors at source level so components
// loaded via moduleNameMapper (@repo/ui → packages/ui/src/index.ts) get the mock.
// Using __dirname template literals avoids jest.mock() hoisting issues since
// __dirname is a CJS module constant (always available), not a declared variable.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock(`${__dirname}/../../packages/ui/src/context/EnvironmentContext`, () => {
    const defaultEnv = {
        theme: 'light', isDark: false,
        colors: {
            background: '#fff', surface: '#f8f8f8', surfaceElevated: '#f0f0f0',
            text: '#1a1a1a', textSecondary: '#666', textTertiary: '#999',
            primary: '#D4AF37', action: '#D4AF37', border: '#eee', error: '#ff4444',
        },
        temporalPhase: 'morning', deviceTier: 'standard',
        networkQuality: 'good', isOnline: true, language: 'en',
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
        background: '#fff', surface: '#f8f8f8', text: '#1a1a1a',
        textSecondary: '#666', textTertiary: '#999',
        primary: '#D4AF37', action: '#D4AF37', border: '#eee', error: '#ff4444',
    })),
}));


jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
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

jest.mock('lucide-react-native', () => {
    const React = require('react');
    const ReactNative = require('react-native');
    const Icon = (props: any) => React.createElement(ReactNative.View, props);
    return new Proxy({}, {
        get: (_target, key) => {
            if (key === '__esModule') return true;
            return Icon;
        }
    });
});
