/**
 * @repo/ui/theme/native — the active world for React Native.
 *
 * Context, motion and type helpers that native components and screens read.
 * Components themselves live in `@repo/ui/components/native`.
 */

export { useSystemAccess } from './access';
export { useErrorFeedback, useFeedback } from './feedback';
export {
  type LivingColorKey,
  useLivingStyle,
  usePressMotion,
  useShake,
  useWorldMotion,
  WorldEnter,
  type WorldEnterProps,
  type WorldMotionTokens,
} from './motion';
export {
  edgeStyle,
  glowStyle,
  isFontAvailable,
  radiusStyle,
  registerAvailableFonts,
  shadowStyle,
  typeStyle,
} from './style';
export {
  useWorld,
  useWorldContext,
  WorldContext,
  type WorldContextValue,
  WorldScope,
  type WorldScopeProps,
} from './WorldContext';
