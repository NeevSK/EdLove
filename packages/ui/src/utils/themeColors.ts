/**
 * getThemeColors - Dynamic Theme Color Selector
 * 
 * Returns the appropriate color palette based on theme mode and temporal phase
 * Usage: const colors = getThemeColors(isDark, temporalPhase);
 */

import { colors as baseColors } from '../theme/Theme';
import { TemporalPhase } from '../context/types';

export interface ThemeColors {
    // Backgrounds
    primary: string;
    secondary: string;
    tertiary: string;

    // Text
    text: string;
    textPrimary: string;
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
    glow: string;
    backgroundDark: string;
    obsidian: string;
    black: string;
}



/**
 * Get theme colors based on dark mode status and temporal phase
 * Temporal phase modulates the base theme for contextual adaptation
 */
export function getThemeColors(isDark: boolean, temporalPhase?: TemporalPhase): ThemeColors {
    // Get base colors for dark/light
    const baseTheme = getBaseThemeColors(isDark);

    // If no temporal phase specified, return base theme
    if (!temporalPhase) {
        return baseTheme;
    }

    // Modulate based on temporal phase
    return modulateForTemporalPhase(baseTheme, temporalPhase, isDark);
}

/**
 * Get base theme colors without temporal modulation
 */
function getBaseThemeColors(isDark: boolean): ThemeColors {
    if (isDark) {
        return {
            // Dark mode backgrounds
            primary: baseColors.obsidian,
            secondary: baseColors.ink,
            tertiary: baseColors.shroud,

            // Dark mode text
            text: baseColors.sacredWhite,
            textPrimary: baseColors.sacredWhite,
            textSecondary: baseColors.starlightGray,
            textTertiary: baseColors.mistGray,

            // Actions (same in both modes)
            action: baseColors.sanctuarySaffron,
            success: baseColors.sageGreen,
            error: baseColors.emberRed,
            warning: baseColors.amberGlow,

            // Functional
            border: 'rgba(252,249,242,0.1)',
            overlay: baseColors.shadowAmbient,
            shadow: baseColors.shadowDeep,
            glow: baseColors.shadowAmbient, // Default glow for dark mode
            backgroundDark: baseColors.backgroundDark,
            obsidian: baseColors.obsidian,
            black: baseColors.black,
        };


    } else {
        return {
            // Light mode backgrounds
            primary: baseColors.vellum,
            secondary: baseColors.silk,
            tertiary: baseColors.linen,

            // Light mode text
            text: baseColors.inkTruth,
            textPrimary: baseColors.inkTruth,
            textSecondary: baseColors.bark,
            textTertiary: baseColors.willow,

            // Actions (same in both modes)
            action: baseColors.sanctuarySaffron,
            success: baseColors.sageGreen,
            error: baseColors.emberRed,
            warning: baseColors.amberGlow,

            // Functional
            border: 'rgba(42,35,24,0.1)',
            overlay: baseColors.shadowAmbient,
            shadow: baseColors.shadowAmbient,
            glow: baseColors.shadowFocus, // Default glow for light mode
            backgroundDark: baseColors.vellum, // Use vellum for light mode "dark" background
            obsidian: baseColors.silk,
            black: baseColors.inkTruth, // Use inkTruth for light mode "black"
        };


    }
}

/**
 * Example usage in components:
 * 
 * import { useEnvironment } from '../context';
 * import { getThemeColors } from '../utils/themeColors';
 * 
 * function MyComponent() {
 *     const { isDark, temporalPhase } = useEnvironment();
 *     const colors = getThemeColors(isDark, temporalPhase);
 *     
 *     return (
 *         <Box sx={{ backgroundColor: colors.primary }}>
 *             <Text color={colors.text}>Hello</Text>
 *         </Box>
 *     );
 * }
 */

/**
 * Modulate theme colors based on temporal phase
 * Each phase has subtle color shifts that create the right mood
 */
function modulateForTemporalPhase(
    baseTheme: ThemeColors,
    phase: TemporalPhase,
    isDark: boolean
): ThemeColors {
    switch (phase) {
        case 'dawn':
            // Dawn: Threshold. Warm emerging. First saffron warmth.
            return {
                ...baseTheme,
                primary: isDark ? '#1F1A12' : '#FDF3E7', // Saffron Ground hints
                action: baseColors.sanctuarySaffron,
                glow: baseColors.amberGlow,
            };

        case 'predawn':
            // Predawn: Still. Hushed. Cool violet.
            return {
                ...baseTheme,
                primary: isDark ? '#14110B' : '#F5EDD6',
                action: baseColors.twilightBlue,
                glow: '#6B6480', // Shadow Violet glow
            };

        case 'morning':
            // Morning: Most alive. Dalu luminous. Post-rain quality.
            return {
                ...baseTheme,
                action: baseColors.sanctuarySaffron,
                success: baseColors.sageGreen,
                glow: '#8BBF7A', // Dalu Green glow
            };

        case 'afternoon':
            // Afternoon: Warming. Saffron building.
            return {
                ...baseTheme,
                action: baseColors.sanctuarySaffron,
                glow: '#E67E22', // Saffron glow
            };

        case 'dusk':
            // Dusk: Violet returning.
            return {
                ...baseTheme,
                action: baseColors.twilightBlue,
                glow: '#6B6480',
            };

        case 'night':
            // Night: Deepest. Jewel.
            return {
                ...baseTheme,
                action: baseColors.gurudeviViolet,
                textSecondary: isDark
                    ? baseColors.mistGray
                    : baseColors.willow,
                glow: baseColors.gurudeviBlue,
            };

        default:
            return baseTheme;
    }
}

// Export base colors for direct access
export const themeColors = {
    primary: baseColors.sanctuarySaffron,
    secondary: baseColors.sageGreen,
    tertiary: baseColors.shroud,
};
