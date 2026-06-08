const MESSAGE =
  'Legacy @react-navigation-based navigators are deprecated in gurudevi-mobile. Use expo-router routes under app/ instead.';

export function failDeprecatedNavigation(moduleName: string): never {
  throw new Error(`${MESSAGE} Module: ${moduleName}`);
}
