module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testMatch: [
        "**/__tests__/**/*.steps.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gluestack-ui/.*|@gluestack-style/.*|moti|framer-motion)'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/assets/',
        '/dist/'
    ]
};
