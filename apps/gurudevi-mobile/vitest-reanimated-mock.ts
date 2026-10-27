const animationIdentity = (value: unknown) => value;

export const useSharedValue = (value: unknown) => ({ value });
export const useAnimatedStyle = () => ({});
export const withTiming = animationIdentity;
export const withDelay = (_delay: number, animation: unknown) => animation;
export const withSequence = (animation: unknown) => animation;
export const withSpring = animationIdentity;
export const withRepeat = (animation: unknown) => animation;
export const cancelAnimation = () => undefined;
export const runOnJS = <T extends (...args: never[]) => unknown>(fn: T) => fn;

export const Easing = {
  linear: (value: number) => value,
  ease: (value: number) => value,
  bezier: () => (value: number) => value,
  in: (value: unknown) => value,
  out: (value: unknown) => value,
  inOut: (value: unknown) => value,
};

export const FadeIn = {};
export const FadeOut = {};
export const FadeInDown = {};
export const FadeInUp = {};
export const FadeOutDown = {};
export const FadeOutUp = {};
export const SlideInDown = {};
export const SlideInUp = {};
export const SlideInLeft = {};
export const SlideOutDown = {};
export const SlideOutUp = {};
export const SlideOutLeft = {};
export const ZoomIn = {};
export const ZoomOut = {};
export const Layout = {};

const Animated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Image: 'Animated.Image',
  ScrollView: 'Animated.ScrollView',
  createAnimatedComponent: <T>(component: T) => component,
};

export default Animated;
