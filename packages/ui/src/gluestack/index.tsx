import type React from 'react';

/**
 * UI Abstraction Layer (Hardened v3)
 *
 * This is the ONLY file that other packages/apps should import from.
 * It provides a stable, hardened foundation using NativeWind v4 primitives.
 */

export * from '@repo/ui/components/ui/avatar';
export * from '@repo/ui/components/ui/badge';
// Core Layout
export * from '@repo/ui/components/ui/box';
// Core Form
export * from '@repo/ui/components/ui/button';
export * from '@repo/ui/components/ui/center';
export * from '@repo/ui/components/ui/checkbox';
export * from '@repo/ui/components/ui/divider';
export * from '@repo/ui/components/ui/form-control';
export * from '@repo/ui/components/ui/hstack';
export * from '@repo/ui/components/ui/icon';
export * from '@repo/ui/components/ui/input';
// Navigation
export * from '@repo/ui/components/ui/link';
export * from '@repo/ui/components/ui/pressable';
export * from '@repo/ui/components/ui/progress';
export * from '@repo/ui/components/ui/radio';
export * from '@repo/ui/components/ui/select';
export * from '@repo/ui/components/ui/slider';
export * from '@repo/ui/components/ui/switch';
export * from '@repo/ui/components/ui/text';
export * from '@repo/ui/components/ui/textarea';
export {
  AnimatedView,
  FlatList,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  View,
} from '@repo/ui/components/ui/view';
export * from '@repo/ui/components/ui/vstack';

// Layers & Overlays
import { PortalProvider } from '@repo/ui/components/ui/portal';

export * from '@repo/ui/components/ui/actionsheet';
export * from '@repo/ui/components/ui/fab';
export * from '@repo/ui/components/ui/image';
export * from '@repo/ui/components/ui/image-background';
export * from '@repo/ui/components/ui/linear-gradient';
export * from '@repo/ui/components/ui/modal';
export * from '@repo/ui/components/ui/overlay';
export * from '@repo/ui/components/ui/portal';
export {
  Spinner,
  Spinner as ActivityIndicator,
} from '@repo/ui/components/ui/spinner';
export * from '@repo/ui/components/ui/toast';

// Hooks
export { useSanctuaryToast as useToast } from '@repo/ui/providers/ToastProvider';

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
