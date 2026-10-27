const config = require('./jest.config.js');

module.exports = {
  ...config,
  preset: 'jest-expo',
  testMatch: [
    '**/attendance-scope-transition.native.jest.test.tsx',
    '**/canonical-capability-hydration.native.jest.test.tsx',
  ],
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^expo-observe$': '<rootDir>/__mocks__/expo-observe.js',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
  },
};
