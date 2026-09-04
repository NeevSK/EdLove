import React from 'react';

// ==========================================
// 1. react-native-reanimated stub
// ==========================================
export const useSharedValue = (initialValue: any) => {
  return { value: initialValue };
};

export const useAnimatedStyle = (updater: () => any) => {
  return {};
};

export const withTiming = (toValue: any, config?: any, callback?: any) => {
  return toValue;
};

export const withDelay = (delay: number, animation: any) => {
  return animation;
};

export const withSequence = (...animations: any[]) => {
  return animations[0];
};

export const withSpring = (toValue: any, config?: any, callback?: any) => {
  return toValue;
};

export const withRepeat = (animation: any, numberOfReps?: number, reverse?: boolean) => {
  return animation;
};

export const interpolate = (value: number, inputRange: number[], outputRange: number[]) => {
  if (inputRange.length < 2 || outputRange.length < 2) return outputRange[0] ?? value;
  const start = inputRange[0]!;
  const end = inputRange[inputRange.length - 1]!;
  const outputStart = outputRange[0]!;
  const outputEnd = outputRange[outputRange.length - 1]!;
  const progress = end === start ? 0 : (value - start) / (end - start);
  return outputStart + progress * (outputEnd - outputStart);
};

export const cancelAnimation = (sharedValue: any) => {};

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  bezier: () => (t: number) => t,
  inOut: (easing: any) => easing,
  out: (easing: any) => easing,
  in: (easing: any) => easing,
};

const createMockComponent = (tag: string) => {
  const Component = React.forwardRef((props: any, ref: any) => {
    return React.createElement(tag, { ...props, ref });
  });
  Component.displayName = `Animated(${tag})`;
  return Component;
};

export const Animated = {
  View: createMockComponent('div'),
  Text: createMockComponent('span'),
  Image: createMockComponent('img'),
  ScrollView: createMockComponent('div'),
  createAnimatedComponent: (component: any) => component,
};

export default Animated;

export const runOnJS = (fn: any) => fn;

// Layout Animations
export const FadeIn = {};
export const FadeOut = {};
export const FadeInDown = {};
export const FadeInUp = {};
export const FadeInLeft = {};
export const FadeInRight = {};
export const FadeOutDown = {};
export const FadeOutUp = {};
export const FadeOutLeft = {};
export const FadeOutRight = {};
export const SlideInDown = {};
export const SlideInUp = {};
export const SlideInLeft = {};
export const SlideInRight = {};
export const SlideOutDown = {};
export const SlideOutUp = {};
export const SlideOutLeft = {};
export const SlideOutRight = {};
export const ZoomIn = {};
export const ZoomOut = {};
export const BounceIn = {};
export const BounceOut = {};
export const Layout = {};

// ==========================================
// 2. expo-modules-core stub
// ==========================================
export class EventEmitter {
  addListener() {
    return { remove: () => {} };
  }
  removeListener() {}
  removeAllListeners() {}
  emit() {}
  listenerCount() {
    return 0;
  }
}

export class NativeModule {}
export class SharedObject {}
export class SharedRef {}
export class UnavailabilityError extends Error {
  constructor(moduleName: string, methodName: string) {
    super(`The method or property ${moduleName}.${methodName} is not available.`);
    this.name = 'UnavailabilityError';
  }
}
export class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'CodedError';
  }
}
export const requireOptionalNativeModule = (moduleName: string) => null;
export const requireNativeModule = (moduleName: string) => null;
export const requireNativeViewManager = (viewName: string) => null;
export const registerWebModule = (moduleName: string) => {};
export const reloadAppAsync = async (reason: string) => {};
export const installOnUIRuntime = () => {};
export const Platform = { OS: 'web', select: (obj: any) => obj.web || obj.default };
export const NativeModulesProxy = {};
export const DeviceEventEmitter = {
  addListener: () => ({ remove: () => {} }),
  emit: () => {},
};
export enum PermissionStatus {
  DENIED = 'denied',
  GRANTED = 'granted',
  UNDETERMINED = 'undetermined',
}
export const createPermissionHook = (options: any) => () => [
  null,
  () => Promise.resolve(null),
  () => Promise.resolve(null),
];
export const uuid = {
  v4: () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }),
  v5: () => '00000000-0000-0000-0000-000000000000',
};

// ==========================================
// 3. react-native-screens stub
// ==========================================
export const enableScreens = () => {};
export const enableFreeze = () => {};
export const screensEnabled = () => false;
export const freezeEnabled = () => false;

export const ScreenContainer = createMockComponent('div');
export const Screen = createMockComponent('div');
export const ScreenStack = createMockComponent('div');
export const ScreenStackHeaderConfig = createMockComponent('div');
export const ScreenStackHeaderSubset = createMockComponent('div');

// ==========================================
// 4. @shopify/react-native-skia stub
// ==========================================
export const Canvas = createMockComponent('div');
export const Rect = createMockComponent('div');
export const Circle = createMockComponent('div');
export const Path = createMockComponent('div');
export const Group = createMockComponent('div');
export const Paint = createMockComponent('div');
export const Shader = createMockComponent('div');
export const ImageShader = createMockComponent('div');
export const LinearGradient = createMockComponent('div');
export const RadialGradient = createMockComponent('div');
export const Skia = {
  Path: {
    Make: () => ({
      moveTo: () => {},
      lineTo: () => {},
      close: () => {},
    }),
  },
};

// ==========================================
// 5. Deep Native subpaths (missing from react-native-web)
// ==========================================
export const codegenNativeComponent = () => Animated.View;
export const processColor = (color: any) => color;
export const resolveAssetSource = (source: any) => source;
export const NativeComponentRegistry = {
  get: () => null,
  register: (name: string, callback: any) => callback,
};
export const get = () => null;
export const ViewConfigIgnore = {};
export const AppContainer = Animated.View;
export const ReactFabric = {};
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};
