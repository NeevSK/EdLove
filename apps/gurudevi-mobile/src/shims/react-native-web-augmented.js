/**
 * Final robust augmented shim for react-native-web.
 *
 * Re-exports everything from react-native-web, injecting missing native
 * utilities like codegenNativeComponent.
 */

// We can import directly because metro.config.js skips the redirect
// when the request originates from this shim file.
export * from 'react-native-web';
export { default } from 'react-native-web';

import { View } from 'react-native-web';

// Add missing native utilities used by various libraries
export const codegenNativeComponent = (_name) => {
  return View || 'div';
};
