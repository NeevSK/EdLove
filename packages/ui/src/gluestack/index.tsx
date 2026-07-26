import type React from 'react';

/**
 * UI Abstraction Layer (Hardened v3)
 *
 * This is the ONLY file that other packages/apps should import from.
 * It provides a stable, hardened foundation using NativeWind v4 primitives.
 */

export * from '@/components/ui/avatar';
export * from '@/components/ui/badge';
// Core Layout
export * from '@/components/ui/box';
// Core Form
export * from '@/components/ui/button';
export * from '@/components/ui/center';
export * from '@/components/ui/checkbox';
export * from '@/components/ui/divider';
export * from '@/components/ui/form-control';
export * from '@/components/ui/hstack';
export * from '@/components/ui/icon';
export * from '@/components/ui/input';
// Navigation
export * from '@/components/ui/link';
export * from '@/components/ui/pressable';
export * from '@/components/ui/progress';
export * from '@/components/ui/radio';
export * from '@/components/ui/select';
export * from '@/components/ui/slider';
export * from '@/components/ui/switch';
export * from '@/components/ui/text';
export * from '@/components/ui/textarea';
export {
  AnimatedView,
  FlatList,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  View,
} from '@/components/ui/view';
export * from '@/components/ui/vstack';

// Layers & Overlays
import { PortalProvider } from '@/components/ui/portal';

export * from '@/components/ui/actionsheet';
export * from '@/components/ui/fab';
export * from '@/components/ui/image';
export * from '@/components/ui/image-background';
export * from '@/components/ui/linear-gradient';
export * from '@/components/ui/modal';
export * from '@/components/ui/overlay';
export * from '@/components/ui/portal';
export {
  Spinner,
  Spinner as ActivityIndicator,
} from '@/components/ui/spinner';
export * from '@/components/ui/toast';

// Hooks
export { useSanctuaryToast as useToast } from '@/providers/ToastProvider';

// Provider
export const GluestackUIProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: any;
}) => {
  return <PortalProvider>{children}</PortalProvider>;
};

// Configuration & Tokens
// Gluestack v3 (NativeWind) doesn't use the legacy createConfig system.
// We provide these to maintain compatibility with existing config files.
export const createConfig = (config: any) => config;
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
