const animation = {
  duration: () => animation,
  delay: () => animation,
  springify: () => animation,
  damping: () => animation,
  mass: () => animation,
  stiffness: () => animation,
  overshootClamping: () => animation,
  restDisplacementThreshold: () => animation,
  restSpeedThreshold: () => animation,
};

const Animated = {
  View: 'AnimatedView',
  Text: 'AnimatedText',
  ScrollView: 'AnimatedScrollView',
  Image: 'AnimatedImage',
};

export const isSharedValue = () => false;
export const useSharedValue = <T>(value: T) => ({ value });
export const useAnimatedStyle = <T>(factory: () => T) => factory();
export const useAnimatedProps = <T>(factory: () => T) => factory();
export const useDerivedValue = <T>(factory: () => T) => ({ value: factory() });
export const withTiming = <T>(value: T, _config?: unknown, callback?: (finished: boolean) => void) => {
  callback?.(true);
  return value;
};
export const withSpring = withTiming;
export const withSequence = <T>(...values: T[]) => values.at(-1);
export const withRepeat = <T>(value: T) => value;
export const cancelAnimation = () => undefined;
export const createAnimatedComponent = <T>(component: T) => component;
export const interpolate = (value: number, _input: number[], output: number[]) => output[0] ?? value;
export const Extrapolate = { CLAMP: 'clamp' };
export const FadeIn = animation;
export const FadeOut = animation;
export const FadeInUp = animation;
export const FadeOutUp = animation;
export const SlideInDown = animation;
export const SlideOutDown = animation;
export const ZoomIn = animation;
export const ZoomOut = animation;
export const Layout = animation;
export const Easing = {
  linear: (value: number) => value,
  ease: (value: number) => value,
  in: <T>(value: T) => value,
  out: <T>(value: T) => value,
  inOut: <T>(value: T) => value,
  bezier: () => (value: number) => value,
};

export default Animated;
