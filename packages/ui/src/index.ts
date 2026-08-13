export { useTranslation } from 'react-i18next';
export {
  default as Animated,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
export { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
export * from '@repo/ui/context';
export * from '@repo/ui/hooks';
export { useNotificationPreferences } from '@repo/ui/hooks/useNotificationPreferences';
// Keep the root surface intentionally light. Heavy UI modules now live behind
// explicit subpaths such as `@repo/ui/components/...` and `@repo/ui/screens/...`.
export * from '@repo/ui/primitives';
export * from '@repo/ui/providers/index';
export * from '@repo/ui/screens/index';
export * from '@repo/ui/theme/Theme';
export * from '@repo/ui/tokens';
export * from '@repo/ui/utils';
export { SanctuaryGuard } from '@repo/ui/components/SanctuaryGuard';
export { SignupPrompt } from '@repo/ui/components/prompts/SignupPrompt';

// Branded Components
export { BrandPulse } from './components/BrandPulse';
export type { BrandPulseProps } from './components/BrandPulse';
export { ErrorState as BrandedErrorState } from './components/ErrorState';
export type { ErrorStateProps } from './components/ErrorState';
export { SuccessCheck, SuccessGlow } from './components/Success';
export { BrandedEmptyState } from './components/BrandedEmptyState';
export type { BrandedEmptyStateProps } from './components/BrandedEmptyState';
export type { ScreenWrapperProps } from './components/ScreenWrapper';
export { ShimmerBlock, SkeletonCard as BrandedSkeletonCard, SkeletonList as BrandedSkeletonList } from './components/Skeleton';
export { duration, easing, scale, color } from './components/motion';
export { useBreakpoint, usePageFrame, useResponsiveGrid } from './components/layout';
export type { PageFrame } from './components/layout';
export { softCrossfadeScale, sharedTransitionTiming } from './components/screenTransitions';
