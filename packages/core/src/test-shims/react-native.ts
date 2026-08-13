// Node-only test shim. Core API tests should not load React Native's Flow source.
export const Platform = { OS: 'web', select: <T>(values: { web?: T; default?: T }) => values.web ?? values.default };
export const AppState = { currentState: 'active', addEventListener: () => ({ remove: () => undefined }) };
export const InteractionManager = { runAfterInteractions: (callback: () => void) => { callback(); return { cancel: () => undefined }; } };
export const Linking = { openURL: async () => undefined, addEventListener: () => ({ remove: () => undefined }) };
export const Share = { share: async () => ({ action: 'sharedAction' }) };
export const StatusBar = {};
export const useWindowDimensions = () => ({ width: 1024, height: 768, scale: 1, fontScale: 1 });
export const StyleSheet = { create: <T extends Record<string, unknown>>(styles: T) => styles };
export const NativeModules = {};
export const defaultExport = {};
export default defaultExport;
