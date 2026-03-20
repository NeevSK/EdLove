import { useMemo } from 'react';
import { useTheme } from './useTheme';
import { ThemeColors, toThemeColors } from '../utils/themeColors';

/**
 * Legacy compatibility hook for components that still expect the older
 * `ThemeColors` shape. New components should prefer `useTheme()`.
 */
export function useThemedColors(): ThemeColors {
    const theme = useTheme();

    const colors = useMemo(
        () => toThemeColors(theme),
        [theme]
    );

    return colors;
}

export default useThemedColors;
