export * from 'react-native-web';

// TurboModuleRegistry is imported directly from 'react-native' by libraries like react-native-svg
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: (name: string) => {
    throw new Error(`TurboModuleRegistry.getEnforcing("${name}") is not available on react-native-web.`);
  },
};
