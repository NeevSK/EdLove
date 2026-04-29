export type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';
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

// Keep the root surface intentionally light. Heavy UI modules now live behind
// explicit subpaths such as `@repo/ui/components/...` and `@repo/ui/screens/...`.
export * from './primitives';
export * from './hooks';
export * from './providers';
export * from './context';
export * from './theme/Theme';
export * from './tokens';
export * from './utils';
