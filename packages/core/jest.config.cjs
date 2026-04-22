const path = require('path');

module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.cjs') }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@react-native|react-native|expo|@expo)/)'],
};
