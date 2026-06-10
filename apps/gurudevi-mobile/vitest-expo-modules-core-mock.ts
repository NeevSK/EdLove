// Headless expo-modules-core mock for Vitest architecture tests
export const requireNativeModule = () => ({});
export const EventEmitter = class {};
export const NativeModulesProxy = {};
export const LegacyEventEmitter = class {};
export default {
  requireNativeModule,
  EventEmitter,
  NativeModulesProxy,
  LegacyEventEmitter,
};
