import { useMemo } from 'react';
import { type ThemeColors, toThemeColors } from '@repo/ui/utils/themeColors';
import { useTheme } from '@repo/ui/hooks/useTheme';

/**
 * Legacy compatibility hook for components that still expect the older
 * `ThemeColors` shape. New components should prefer `useTheme()`.
 */
export function useThemedColors(): ThemeColors {
  const theme = useTheme();

  const colors = useMemo(() => toThemeColors(theme), [theme]);

  return colors;
}

export default useThemedColors;
