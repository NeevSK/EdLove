/**
 * getThemeColors - Dynamic Theme Color Selector
 * 
 * Returns the appropriate color palette based on theme mode and temporal phase
 * Usage: const colors = getThemeColors(isDark, temporalPhase);
 */

import { colors as baseColors } from '../constants/Theme';
import { TemporalPhase } from '../context/types';

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
            // Dawn: Warm, gentle awakening tones
            return {
                ...baseTheme,
                action: baseColors.dawnGold, // Warmer gold for dawn
                tertiary: isDark 
                    ? baseColors.deepIndigo 
                    : '#FFF8E7', // Soft cream for light mode
            };
            
        case 'day':
            // Day: Bright, energetic, high contrast
            return {
                ...baseTheme,
                action: baseColors.gurudeviBlue, // Electric blue for day energy
                // Keep other colors at full intensity
            };
            
        case 'evening':
            // Evening: Warm transition to rest
            return {
                ...baseTheme,
                action: baseColors.sanctuarySaffron, // Warmer saffron
                tertiary: isDark
                    ? baseColors.midnightBlue
                    : '#F5E6D3', // Warmer cream for light mode
            };
            
        case 'night':
            // Night: Muted, restful, low stimulation
            return {
                ...baseTheme,
                action: baseColors.twilightPurple, // Softer purple for night
                textSecondary: isDark
                    ? baseColors.dimGray // More muted text
                    : baseColors.slateGray,
            };
            
        default:
            return baseTheme;
    }
}

// Export base colors for direct access
export const themeColors = {
    primary: baseColors.sanctuarySaffron,
    secondary: baseColors.sageGreen,
    tertiary: baseColors.midnightBlue,
};
