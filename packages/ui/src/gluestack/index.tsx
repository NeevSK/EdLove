import React from 'react';

/**
 * UI Abstraction Layer (Hardened v3)
 * 
 * This is the ONLY file that other packages/apps should import from.
 * It provides a stable, hardened foundation using NativeWind v4 primitives.
 */

// Core Layout
export * from '../components/ui/box';
export * from '../components/ui/center';
export * from '../components/ui/hstack';
export * from '../components/ui/vstack';
export * from '../components/ui/view';
export * from '../components/ui/text';
export * from '../components/ui/divider';

// Core Form
export * from '../components/ui/button';
export * from '../components/ui/input';
export * from '../components/ui/form-control';
export * from '../components/ui/switch';
export * from '../components/ui/checkbox';
export * from '../components/ui/select';
export * from '../components/ui/textarea';
export * from '../components/ui/progress';

// Navigation
export * from '../components/ui/link';

// Layers & Overlays
import { PortalProvider } from '../components/ui/portal';
export * from '../components/ui/portal';
export * from '../components/ui/overlay';
export * from '../components/ui/modal';
export * from '../components/ui/toast';
export * from '../components/ui/actionsheet';
export * from '../components/ui/spinner';

// Hooks
export { useSanctuaryToast as useToast } from '../providers/ToastProvider';

// Provider
export const GluestackUIProvider = ({ children, config }: { children: React.ReactNode; config?: any }) => {
    return (
        <PortalProvider>
            {children}
        </PortalProvider>
    );
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
