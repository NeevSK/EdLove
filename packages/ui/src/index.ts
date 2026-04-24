import React from 'react';

// 1. Fundamental Styling & Canonical Primitives
export * from './theme/Theme';
export * from './components/ui/box';
export * from './components/ui/center';
export * from './components/ui/hstack';
export * from './components/ui/vstack';
export {
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  AnimatedView,
  KeyboardAvoidingView,
} from './components/ui/view';
export * from './components/ui/text';
export * from './components/ui/divider';
export * from './components/ui/icon';
export * from './components/ui/pressable';
export * from './components/ui/badge';
export * from './components/ui/button';
export * from './components/ui/input';
export * from './components/ui/form-control';
export * from './components/ui/switch';
export * from './components/ui/checkbox';
export * from './components/ui/select';
export * from './components/ui/textarea';
export * from './components/ui/progress';
export * from './components/ui/slider';
export * from './components/ui/avatar';
export * from './components/ui/radio';
export * from './components/ui/link';
export * from './components/ui/portal';
export * from './components/ui/overlay';
export * from './components/ui/modal';
export * from './components/ui/toast';
export * from './components/ui/actionsheet';
export { Spinner, Spinner as ActivityIndicator } from './components/ui/spinner';
export * from './components/ui/fab';
export * from './components/ui/image';
export * from './components/ui/image-background';
export * from './components/ui/linear-gradient';

import { PortalProvider } from './components/ui/portal';

export const GluestackUIProvider = ({ children }: { children: React.ReactNode; config?: any }) => {
  return React.createElement(PortalProvider, null, children);
};

export const createConfig = <T>(config: T) => config;
export const gluestackConfig = {
  tokens: {
    colors: {},
    space: {},
    fontSizes: {},
    lineHeights: {},
    letterSpacings: {},
    fonts: {},
    fontWeights: {},
    radii: {},
    borderWidths: {},
    breakpoints: {},
    mediaQueries: {},
    opacity: {},
    shadows: {},
    zIndex: {},
  },
  aliases: {},
};

// 2. Context & Providers (Logic State)
export * from './context';
export * from './providers/ToastProvider';
export { SanctuaryProvider } from './providers/SanctuaryProvider';

// 3. Hooks (Logic Access)
export * from './hooks/useTheme';
export * from './hooks/useThemedColors';
export * from './hooks/useAccessibility';
export * from './hooks/useDemoBridge';
export { useTranslation } from 'react-i18next';

// 4. Components (UI Building Blocks)
export * from './components';

// 5. Screens (Pages/Compositions)
export * from './screens';

// Utilities
export * from './utils/DeviceUtils';
export * from './utils/haptics';
export * from './utils/themeColors';
export * from './utils/linking';
export * from './utils/SanctuaryLocation';
export * from './utils/colorUtils';
export * from './utils/stringUtils';
export * from './utils/dateTimeUtils';
export * from './utils/a11yUtils';

// Canvas & Workspace (Shared patterns)
export type {
  WorkspaceSurfaceDefinition,
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceZoneId,
} from '@repo/core/types';

// Re-exports for common animations (compatibility)
export {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';

export { useSanctuaryToast, useSanctuaryToast as useLotusToast } from './providers/ToastProvider';
