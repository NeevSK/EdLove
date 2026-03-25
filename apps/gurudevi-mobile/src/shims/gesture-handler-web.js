/**
 * Web shim for react-native-gesture-handler.
 */

const noop = () => {};
const noopComponent = ({ children }) => children;

module.exports = {
  GestureHandlerRootView: noopComponent,
  PanGestureHandler: noopComponent,
  TapGestureHandler: noopComponent,
  State: {},
  Directions: {},
  GestureDetector: noopComponent,
  Gesture: {
    Pan: () => ({
      onUpdate: () => ({ onEnd: () => ({}) }),
    }),
  },
};
