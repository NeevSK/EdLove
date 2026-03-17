/**
 * native-shim.web.ts
 * 
 * This file shims native-only packages to prevent build-time crashes on web.
 * In a real-world scenario, you might alias these in your webpack/bundler config.
 */

// Mock react-native-maps
export const MapView = () => null;
export const Marker = () => null;
export const PROVIDER_GOOGLE = 'google';

// Mock other native-only secrets if needed
export const NativeModules = {};
