import React from 'react';

// ============================================================================
// TIER 1: FOUNDATIONS (Tokens, Theme, Config)
// ============================================================================
export * from './theme/Theme';
export * from './tokens';
export { SanctuaryGlobalStyles } from './components/SanctuaryGlobalStyles';
export { createConfig, gluestackConfig, GluestackUIProvider } from './gluestack';

// ============================================================================
// TIER 2: PRIMITIVES (Base UI Components)
// ============================================================================
// We export these through the gluestack abstraction for consistency
export * from './gluestack';

// ============================================================================
// TIER 3: COMPOSITIONS (Design System Components)
// ============================================================================
export * from './components';

// ============================================================================
// TIER 4: CONTEXT & LOGIC (Providers, Hooks, Contexts)
// ============================================================================
export * from './context';
export * from './hooks/useAccessibility';
export * from './hooks/useDemoBridge';
export * from './hooks/useResponsive';
export * from './hooks/useTheme';
export * from './hooks/useThemedColors';
export { SanctuaryProvider } from './providers/SanctuaryProvider';
export * from './providers/ToastProvider';
export {
  useSanctuaryToast,
  useSanctuaryToast as useLotusToast,
  useSanctuaryToast as useToast,
} from './providers/ToastProvider';

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
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';

// ============================================================================
// TIER 6: SCREENS & COMPOSITIONS
// ============================================================================
export * from './screens';

// ============================================================================
// TIER 7: UTILITIES
// ============================================================================
export * from './utils/a11yUtils';
export * from './utils/colorUtils';
export * from './utils/DeviceUtils';
export * from './utils/dateTimeUtils';
export * from './utils/haptics';
export * from './utils/linking';
export * from './utils/SanctuaryLocation';
export * from './utils/stringUtils';
export * from './utils/themeColors';
