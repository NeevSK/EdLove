/**
 * Self-Healing Web Shim for react-native-worklets
 */
import bridge from './universal-bridge';

const Worklets = bridge('react-native-worklets', {
  createRunOnJS: (fn) => fn,
  createRunOnUI: (fn) => fn,
  useWorklet: (fn) => fn,
});

export const { createRunOnJS, createRunOnUI, useWorklet } = Worklets;
export default Worklets;
