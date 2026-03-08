import { useWindowDimensions } from 'react-native';

/**
 * useResponsive Hook
 * 
 * Provides responsive breakpoints based on window width.
 * Standard breakpoints:
 * - Mobile: < 768
 * - Tablet: >= 768
 * - Desktop: >= 1024
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;

    return {
        width,
        height,
        isTablet,
        isDesktop,
        isMobile: !isTablet,
        orientation: width > height ? 'landscape' : 'portrait',
    };
}
