import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    define: {
        __DEV__: 'true',
    },
    resolve: {
        // Vite 8 resolves the aliases declared in tsconfig.json natively.
        // Keeping this here avoids a separate vite-tsconfig-paths plugin and its
        // config-loader warning while preserving the mobile test import contract.
        tsconfigPaths: true,
        alias: [
            {
                find: /^@repo\/([^/]+)(\/.*)?$/,
                replacement: `${resolve(import.meta.dirname, '../../packages')}/$1/src$2`,
            },
            { find: 'react-native', replacement: resolve(import.meta.dirname, './vitest-react-native-mock.ts') },
            { find: 'expo-sqlite', replacement: resolve(import.meta.dirname, './vitest-sqlite-mock.ts') },
            { find: 'expo-modules-core', replacement: resolve(import.meta.dirname, './vitest-expo-modules-core-mock.ts') },
            { find: 'expo-constants', replacement: resolve(import.meta.dirname, './vitest-expo-constants-mock.ts') },
            { find: '@cedar-policy/cedar-wasm/web', replacement: resolve(import.meta.dirname, './vitest-cedar-web-mock.ts') },
        ],
    },
    test: {
        fsModuleCache: true,
        sharedViteServer: true,
        globals: true,
        environment: 'jsdom',
        include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
        exclude: [
            '**/node_modules/**',
            'src/__tests__/components/**',
            'src/__tests__/architecture/AppPerformance.test.tsx',
            'src/__tests__/architecture/classroom-surface-entrypoints.test.ts',
            'src/__tests__/architecture/founder-stack-boundaries.test.ts',
        ],
        tags: [
            { name: 'a11y', description: 'Accessibility, contrast, font scaling, and semantic audits' },
            { name: 'theme', description: 'Design tokens and theme boundary audits' },
            { name: 'fast', description: 'Fast execution suites' },
        ],
        server: {
            forwardConsole: true,
            deps: {
                inline: [/packages/, /@repo\//, /expo-modules-core/],
                external: [
                    'react-native-mmkv',
                    'expo',
                    'expo-constants',
                    'expo-device',
                    'expo-haptics',
                    'expo-location',
                    'expo-notifications',
                    'expo-secure-store',
                ],
            },
        },
    },
});
