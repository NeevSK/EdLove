import React from 'react';

// ============================================================================
// TIER 5: EXTERNAL BRIDGE (Core Types & Re-animated)
// ============================================================================
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

// ============================================================================
// TIER 3: COMPOSITIONS (Design System Components)
// ============================================================================
export * from './components';
// Direct media exports stay on the public surface, but bypass the broad components barrel
// so platform-specific files do not participate in root require cycles.
export type { VideoPlayerProps } from './components/media/VideoPlayer';
export { VideoPlayer } from './components/media/VideoPlayer';
export { SanctuaryGlobalStyles } from './components/SanctuaryGlobalStyles';
// ============================================================================
// TIER 4: CONTEXT & LOGIC (Providers, Hooks, Contexts)
// ============================================================================
export * from './context';
// ============================================================================
// TIER 2: PRIMITIVES (Base UI Components)
// ============================================================================
// We export these through the gluestack abstraction for consistency
export * from './gluestack';
// Resolve ambiguities by explicitly re-exporting component versions of common names
export {
  Badge,
  Box,
  CheckIcon,
  createConfig,
  GluestackUIProvider,
  gluestackConfig,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Radio,
  Slider,
  Text,
  View,
  VStack,
} from './gluestack';
export * from './hooks/useAccessibility';
export * from './hooks/useDemoBridge';
export * from './hooks/useResponsive';
export * from './hooks/useTheme';
export * from './hooks/useThemedColors';
// ============================================================================
// TIER 8: ICONS & BRANDING
// ============================================================================
export * from './icons';
export { SanctuaryProvider } from './providers/SanctuaryProvider';
export * from './providers/ToastProvider';
export {
  useSanctuaryToast,
  useSanctuaryToast as useLotusToast,
  useSanctuaryToast as useToast,
} from './providers/ToastProvider';

// ============================================================================
// TIER 6: SCREENS & COMPOSITIONS
// ============================================================================
export * from './screens';

// ============================================================================
// TIER 1: FOUNDATIONS (Tokens, Theme, Config)
// ============================================================================
export * from './theme/Theme';
export * from './tokens';

// ============================================================================
// TIER 7: UTILITIES
// ============================================================================
export * from './utils/a11yUtils';
export * from './utils/colorUtils';
export * from './utils/DeviceUtils';
export * from './utils/dateTimeUtils';
export * from './utils/dialogs';
export * from './utils/haptics';
export * from './utils/linking';
export * from './utils/SanctuaryLocation';
export * from './utils/shareAction';
export * from './utils/stringUtils';
export * from './utils/themeColors';
