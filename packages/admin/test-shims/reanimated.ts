const animation = {
  damping: () => animation,
  delay: () => animation,
  duration: () => animation,
  mass: () => animation,
  springify: () => animation,
  stiffness: () => animation,
};

const Animated = {
  Image: 'AnimatedImage',
  ScrollView: 'AnimatedScrollView',
  Text: 'AnimatedText',
  View: 'AnimatedView',
};

export const cancelAnimation = () => undefined;
export const createAnimatedComponent = <T>(component: T) => component;
export const Easing = { linear: (value: number) => value };
export const FadeIn = animation;
export const FadeOut = animation;
export const interpolate = (value: number, _input: number[], output: number[]) => output[0] ?? value;
export const isSharedValue = () => false;
export const useAnimatedStyle = <T>(factory: () => T) => factory();
export const useSharedValue = <T>(value: T) => ({ value });
export const withSpring = <T>(value: T) => value;
export const withTiming = <T>(value: T) => value;

export default Animated;
