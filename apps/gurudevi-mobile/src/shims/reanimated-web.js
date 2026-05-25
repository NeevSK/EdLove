/* eslint-disable */
/**
 * Self-Healing Web Shim for react-native-reanimated
 *
 * Uses the Universal Bridge (CJS) to prevent crashes on missing properties like .experiment
 * by allowing the Proxy to fulfill any named import at runtime.
 */
const { useRef } = require('react');
const bridge = require('./universal-bridge');

const useSharedValue = (initialValue) => {
  const ref = useRef(initialValue);
  return {
    get value() {
      return ref.current;
    },
    set value(v) {
      ref.current = v;
    },
  };
};

const useAnimatedStyle = (updater) => {
  return updater();
};

const useAnimatedProps = (updater) => {
  return updater();
};

const useDerivedValue = (updater) => {
  return { value: updater() };
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t,
  cubic: (t) => t,
  poly: () => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: () => (t) => t,
  back: () => (t) => t,
  bounce: (t) => t,
  bezier: () => (t) => t,
  in: (f) => f,
  out: (f) => f,
  inOut: (f) => f,
};

const React = require('react');
const {
  View: RNView,
  Text: RNText,
  ScrollView: RNScrollView,
  Image: RNImage,
} = require('react-native');

const filterReanimatedProps = (props) => {
  const {
    entering,
    exiting,
    layout,
    sharedTransitionTag,
    sharedTransitionStyle,
    adapters,
    ...rest
  } = props;
  return rest;
};

const AnimatedView = React.forwardRef((props, ref) => {
  return React.createElement(RNView, { ref, ...filterReanimatedProps(props) });
});
AnimatedView.displayName = 'Animated.View';

const AnimatedText = React.forwardRef((props, ref) => {
  return React.createElement(RNText, { ref, ...filterReanimatedProps(props) });
});
AnimatedText.displayName = 'Animated.Text';

const AnimatedScrollView = React.forwardRef((props, ref) => {
  return React.createElement(RNScrollView, { ref, ...filterReanimatedProps(props) });
});
AnimatedScrollView.displayName = 'Animated.ScrollView';

const AnimatedImage = React.forwardRef((props, ref) => {
  return React.createElement(RNImage, { ref, ...filterReanimatedProps(props) });
});
AnimatedImage.displayName = 'Animated.Image';

const Animated = {
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  Image: AnimatedImage,
  createAnimatedComponent: (Component) => Component,
};

// Create the self-healing bridge with explicitly defined base mocks
const reanimatedShim = bridge('react-native-reanimated', {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedScrollHandler: () => () => {},
  useAnimatedGestureHandler: () => () => {},
  withTiming: (toValue, _userConfig, callback) => {
    if (callback) callback(true);
    return toValue;
  },
  withSpring: (toValue, _userConfig, callback) => {
    if (callback) callback(true);
    return toValue;
  },
  withRepeat: (animation) => animation,
  withSequence: (...animations) => animations[0],
  withDelay: (_delay, animation) => animation,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  makeMutable: (value) => ({ value }),
  interpolate: (_value, _input, output) => output[0],
  Extrapolate: { CLAMP: 'clamp', IDENTITY: 'identity', EXTEND: 'extend' },
  Animated,
  Easing,
  // The experiment prop will now be caught by the Proxy at runtime!
});

// Final robust Proxy-based export for reanimated-web.js
const handler = {
  get(target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return Animated;
    if (prop in target) return target[prop];
    if (prop in Animated) return Animated[prop];
    // catch-all: return a no-op proxy for ANYTHING including 'experiment'
    return new Proxy(() => {}, {
      get(_, _p) {
        return () => {};
      },
      apply() {
        return undefined;
      },
    });
  },
};

module.exports = new Proxy(reanimatedShim, handler);
module.exports.__esModule = true;
module.exports.default = Animated;
module.exports.experiment = {}; // explicit  belt AND suspenders
