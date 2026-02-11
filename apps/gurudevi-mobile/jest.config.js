// https://docs.expo.dev/guides/testing-with-jest/
module.exports = {
    preset: 'jest-expo/web',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui/.*|@gluestack-style/.*|lucide-react-native|moti|@motify/.*|react-native-web)',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'feature'],
    testMatch: ['**/__tests__/**/*.steps.[jt]s?(x)', '**/__tests__/**/*.test.[jt]s?(x)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
