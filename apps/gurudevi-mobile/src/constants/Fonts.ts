/**
 * Font Configuration
 * 
 * Defines font families for Sinhala, Tamil, and English text.
 * Fonts are loaded via expo-font in App.tsx
 * 
 * Using downloaded fonts from assets/fonts/static/
 * - Sinhala: Abhaya Libre (5 weights available)
 * - Tamil: Baloo Thambi 2 (5 weights available)
 * 
 * Strategy: Modern & Friendly (Option 2)
 * - Scholarly Sinhala with Abhaya Libre
 * - Warm Tamil with Baloo Thambi 2
 */

export const Fonts = {
    // Sinhala fonts (Abhaya Libre - Elegant serif)
    sinhala: {
        regular: 'AbhayaLibre-Regular',
        medium: 'AbhayaLibre-Medium',
        semibold: 'AbhayaLibre-SemiBold',
        bold: 'AbhayaLibre-Bold',
        extrabold: 'AbhayaLibre-ExtraBold',
    },

    // Tamil fonts (Baloo Thambi 2 - Friendly rounded)
    tamil: {
        regular: 'BalooThambi2-Regular',
        medium: 'BalooThambi2-Medium',
        semibold: 'BalooThambi2-SemiBold',
        bold: 'BalooThambi2-Bold',
        extrabold: 'BalooThambi2-ExtraBold',
    },

    // English/Latin fonts (System default)
    english: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
        extrabold: 'System',
    },
} as const;

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/**
 * Get appropriate font family based on language
 */
export function getFontFamily(
    language: 'si' | 'ta' | 'en',
    weight: FontWeight = 'regular'
): string {
    switch (language) {
        case 'si':
            return Fonts.sinhala[weight];
        case 'ta':
            return Fonts.tamil[weight];
        case 'en':
        default:
            return Fonts.english[weight];
    }
}

/**
 * Font loading map for expo-font
 * Maps friendly names to actual font files in assets/fonts/static/
 * 
 * Note: Using 3 main weights for simplicity (Regular, Medium, Bold)
 * Can add SemiBold and ExtraBold later if needed
 */
export const fontAssets = {
    // Abhaya Libre (Sinhala) - 5 weights
    'AbhayaLibre-Regular': require('../../assets/fonts/static/AbhayaLibre-Regular.ttf'),
    'AbhayaLibre-Medium': require('../../assets/fonts/static/AbhayaLibre-Medium.ttf'),
    'AbhayaLibre-SemiBold': require('../../assets/fonts/static/AbhayaLibre-SemiBold.ttf'),
    'AbhayaLibre-Bold': require('../../assets/fonts/static/AbhayaLibre-Bold.ttf'),
    'AbhayaLibre-ExtraBold': require('../../assets/fonts/static/AbhayaLibre-ExtraBold.ttf'),

    // Baloo Thambi 2 (Tamil) - 5 weights
    'BalooThambi2-Regular': require('../../assets/fonts/static/BalooThambi2-Regular.ttf'),
    'BalooThambi2-Medium': require('../../assets/fonts/static/BalooThambi2-Medium.ttf'),
    'BalooThambi2-SemiBold': require('../../assets/fonts/static/BalooThambi2-SemiBold.ttf'),
    'BalooThambi2-Bold': require('../../assets/fonts/static/BalooThambi2-Bold.ttf'),
    'BalooThambi2-ExtraBold': require('../../assets/fonts/static/BalooThambi2-ExtraBold.ttf'),
};
