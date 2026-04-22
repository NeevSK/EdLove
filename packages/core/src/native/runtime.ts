import { Platform } from 'react-native';

/**
 * Runtime Readiness Tracker
 *
 * Works around the "JavaScriptContextHolder.get() on null" race condition in
 * React Native Bridgeless mode.
 */

let _isReady = false;
const _readyListeners: Array<(ready: boolean) => void> = [];

// Mark as ready after the initial execution tick.
// This allows native Bridgeless setup to complete before JS hits JSI hard.
setTimeout(() => {
  _isReady = true;
  _readyListeners.forEach((listener) => {
    listener(true);
  });
}, 0);

export const Runtime = {
  /**
   * Returns true if the JSI runtime is settled and ready for native module access.
   */
  isReady: () => _isReady || Platform.OS === 'web',

  /**
   * Subscribe to readiness changes.
   */
  onReady: (callback: (ready: boolean) => void) => {
    if (_isReady) {
      callback(true);
      return () => {};
    }
    _readyListeners.push(callback);
    return () => {
      const index = _readyListeners.indexOf(callback);
      if (index > -1) _readyListeners.splice(index, 1);
    };
  },

  /**
   * Returns a promise that resolves when the runtime is ready.
   */
  waitForReady: () =>
    new Promise<void>((resolve) => {
      if (Runtime.isReady()) resolve();
      else Runtime.onReady(() => resolve());
    }),
};
