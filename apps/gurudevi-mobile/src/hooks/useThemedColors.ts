import { useMemo } from 'react';
import { useEnvironment } from '../context';
import { getThemeColors, ThemeColors } from '../utils/themeColors';

/**
 * Hook to get theme-aware colors synchronised with the Environment Engine
 * This is the preferred way to consume colors in components.
 */
export function useThemedColors(): ThemeColors {
    const { isDark, temporalPhase } = useEnvironment();

    // Memoize to avoid unnecessary re-computations
    const colors = useMemo(() => {
        return getThemeColors(isDark, temporalPhase);
    }, [isDark, temporalPhase]);

    return colors;
}

export default useThemedColors;
