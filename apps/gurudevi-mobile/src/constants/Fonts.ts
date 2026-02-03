/**
 * Font Configuration
 * 
 * Defines font families for Sinhala, Tamil, and English text.
 * Fonts are loaded via expo-font in App.tsx
 * 
 * Using static fonts from assets/fonts/static/
 * - Sinhala: NotoSansSinhala (Regular, Medium, Bold)
 * - Tamil: NotoSansTamil (Regular, Medium, Bold)
 */

export const Fonts = {
    // Sinhala fonts (Noto Sans Sinhala)
    sinhala: {
        regular: 'NotoSansSinhala-Regular',
        medium: 'NotoSansSinhala-Medium',
        bold: 'NotoSansSinhala-Bold',
    },

    // Tamil fonts (Noto Sans Tamil)
    tamil: {
        regular: 'NotoSansTamil-Regular',
        medium: 'NotoSansTamil-Medium',
        bold: 'NotoSansTamil-Bold',
    },

    // English/Latin fonts (System default or custom)
    english: {
        regular: 'System',  // Use system default for now
        medium: 'System',
        bold: 'System',
    },
} as const;

/**
 * Get appropriate font family based on language
 */
export function getFontFamily(language: 'si' | 'ta' | 'en', weight: 'regular' | 'medium' | 'bold' = 'regular') {
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
 */
export const fontAssets = {
    // Sinhala fonts
    'NotoSansSinhala-Regular': require('../../assets/fonts/static/NotoSansSinhala-Regular.ttf'),
    'NotoSansSinhala-Medium': require('../../assets/fonts/static/NotoSansSinhala-Medium.ttf'),
    'NotoSansSinhala-Bold': require('../../assets/fonts/static/NotoSansSinhala-Bold.ttf'),

    // Tamil fonts
    'NotoSansTamil-Regular': require('../../assets/fonts/static/NotoSansTamil-Regular.ttf'),
    'NotoSansTamil-Medium': require('../../assets/fonts/static/NotoSansTamil-Medium.ttf'),
    'NotoSansTamil-Bold': require('../../assets/fonts/static/NotoSansTamil-Bold.ttf'),
};
