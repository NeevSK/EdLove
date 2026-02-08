/**
 * getThemeColors - Dynamic Theme Color Selector
 * 
 * Returns the appropriate color palette based on theme mode
 * Usage: const colors = getThemeColors(isDark);
 */

import { colors as baseColors } from '../constants/Theme';

export interface ThemeColors {
    // Backgrounds
    primary: string;
    secondary: string;
    tertiary: string;
    
    // Text
    text: string;
    textSecondary: string;
    textTertiary: string;
    
    // Actions
    action: string;
    success: string;
    error: string;
    warning: string;
    
    // Functional
    border: string;
    overlay: string;
    shadow: string;
}

/**
 * Get theme colors based on dark mode status
 */
export function getThemeColors(isDark: boolean): ThemeColors {
    if (isDark) {
        return {
            // Dark mode backgrounds
            primary: baseColors.voidIndigo,
            secondary: baseColors.deepIndigo,
            tertiary: baseColors.midnightBlue,
            
            // Dark mode text
            text: baseColors.sacredWhite,
            textSecondary: baseColors.pearlGray,
            textTertiary: baseColors.mistGray,
            
            // Actions (same in both modes)
            action: baseColors.sanctuarySaffron,
            success: baseColors.sageGreen,
            error: baseColors.emberRed,
            warning: baseColors.amberGlow,
            
            // Functional
            border: 'rgba(255,255,255,0.1)',
            overlay: baseColors.overlayDark,
            shadow: baseColors.shadowDark,
        };
    } else {
        return {
            // Light mode backgrounds
            primary: baseColors.creamSilence,
            secondary: baseColors.lotusWhite,
            tertiary: baseColors.sandStone,
            
            // Light mode text
            text: baseColors.charcoalTruth,
            textSecondary: baseColors.slateGray,
            textTertiary: baseColors.stoneGray,
            
            // Actions (same in both modes)
            action: baseColors.sanctuarySaffron,
            success: baseColors.sageGreen,
            error: baseColors.emberRed,
            warning: baseColors.amberGlow,
            
            // Functional
            border: 'rgba(0,0,0,0.1)',
            overlay: baseColors.overlayLight,
            shadow: baseColors.shadowLight,
        };
    }
}

/**
 * Example usage in components:
 * 
 * import { useTheme } from '../hooks/useTheme';
 * import { getThemeColors } from '../utils/themeColors';
 * 
 * function MyComponent() {
 *     const { isDark } = useTheme();
 *     const colors = getThemeColors(isDark);
 *     
 *     return (
 *         <Box sx={{ backgroundColor: colors.primary }}>
 *             <Text color={colors.text}>Hello</Text>
 *         </Box>
 *     );
 * }
 */

// Export base colors for direct access
export const themeColors = {
    primary: baseColors.sanctuarySaffron,
    secondary: baseColors.sageGreen,
    tertiary: baseColors.midnightBlue,
};
