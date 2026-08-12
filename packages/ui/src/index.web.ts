export { useTranslation } from 'react-i18next';
export {
  default as Animated,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
} from '@repo/ui/shims/native-web-stub';
export { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
export * from '@repo/ui/context';
export * from '@repo/ui/hooks';
export { useNotificationPreferences } from '@repo/ui/hooks/useNotificationPreferences';
export * from '@repo/ui/primitives';
export * from '@repo/ui/providers/index';
export * from '@repo/ui/screens/index';
export * from '@repo/ui/theme/Theme';
export * from '@repo/ui/tokens';
export * from '@repo/ui/utils';

// Keep the web entrypoint's public exports aligned with the default entrypoint.
// The app root imports branded fallbacks from `@repo/ui`; omitting these here
// turns a valid component into `undefined` only in production web bundles.
export { BrandPulse } from './components/BrandPulse';
export { ErrorState as BrandedErrorState } from './components/ErrorState';
export { SuccessCheck, SuccessGlow } from './components/Success';
export { BrandedEmptyState } from './components/BrandedEmptyState';
export {
  ShimmerBlock,
  SkeletonCard as BrandedSkeletonCard,
  SkeletonList as BrandedSkeletonList,
} from './components/Skeleton';
export { duration, easing, scale, color } from './components/motion';
export { useBreakpoint, useResponsiveGrid } from './components/layout';
export { softCrossfadeScale, sharedTransitionTiming } from './components/screenTransitions';
