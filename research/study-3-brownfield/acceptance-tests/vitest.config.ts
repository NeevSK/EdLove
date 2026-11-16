import path from 'node:path';

const coreSrc =
  process.env.CORE_SRC_DIR || path.resolve(import.meta.dirname, '../../../packages/core/src');
const policiesSrc =
  process.env.POLICIES_SRC_DIR || path.resolve(import.meta.dirname, '../../../packages/policies/src');
const vergerSrc =
  process.env.VERGER_SRC_DIR ||
  path.resolve(import.meta.dirname, '../../../packages/verger-core/src/index.ts');

export default {
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      '@repo/core': coreSrc,
      '@repo/policies': policiesSrc,
      '@repo/verger-core': vergerSrc,
      'expo-constants': path.resolve(coreSrc, 'test-shims/expo-constants.ts'),
      'react-native': path.resolve(coreSrc, 'test-shims/react-native.ts'),
    },
  },
  define: {
    __DEV__: 'true',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['e1-integrity-acceptance.test.ts'],
  },
};
