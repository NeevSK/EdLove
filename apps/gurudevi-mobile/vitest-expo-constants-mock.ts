// Test-only Expo Constants shim. Expo 57's published Constants.js imports
// Constants.types without an extension, which Vitest's externalized ESM
// loader cannot resolve on Windows. Runtime/native bundles continue to use
// the real expo-constants package.
export const ExecutionEnvironment = {
  StoreClient: 'storeClient',
  Bare: 'bare',
  Standalone: 'standalone',
} as const;

const Constants = {
  expoConfig: { extra: { publicRuntime: {} } },
  executionEnvironment: ExecutionEnvironment.Bare,
};

export default Constants;
