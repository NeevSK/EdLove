// 1. Fundamental Styling & Gluestack (Base)
export * from './theme/Theme';
export * from './gluestack';

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
    WorkspaceZoneId 
} from '@repo/core';

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
