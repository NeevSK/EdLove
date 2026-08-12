module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/[^/]*/node_modules/)?(?:(jest-)?react-native|@react-native(-community)?|expo[^/]*|@expo[^/]*/|@expo-google-fonts/|react-navigation|@react-navigation/|@unimodules/|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui/|@gluestack-style/|lucide-react-native|react-native-reanimated|@shopify/react-native-skia|@tanstack/|@testing-library/|apca-w3|culori|colorparsley|uuid))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    // Resolve @repo/ui subpaths from this package's source tree. The generic
    // workspace mapping below intentionally targets package entrypoints, but
    // it cannot resolve UI exports such as @repo/ui/icons or component paths.
    '^@repo/ui/(.*)$': '<rootDir>/src/$1',
    '^@repo/ui$': '<rootDir>/src/index.ts',
    '^lucide-react-native/icons$': '<rootDir>/__mocks__/lucide-icons.js',
    '^@repo/core/sync$': '<rootDir>/../core/src/lib/sync/index.ts',
    '^@repo/core/powersync$': '<rootDir>/../core/src/adapters/powersync/index.ts',
    '^@repo/core/storage-wrapper$': '<rootDir>/../core/src/lib/storageWrapper.ts',
    '^@repo/core/offline$': '<rootDir>/../core/src/offline/resilience.ts',
    '^@repo/core/lib$': '<rootDir>/../core/src/lib/index.ts',
    '^@repo/core/([^/]+)$': '<rootDir>/../core/src/$1/index.ts',
    '^@repo/(.*)$': '<rootDir>/../$1/src/index.ts',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
};
