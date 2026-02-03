/**
 * Font Configuration
 * 
 * Defines font families for Sinhala, Tamil, and English text.
 * Fonts are loaded via expo-font in App.tsx
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
 * Maps friendly names to actual font files
 */
export const fontAssets = {
    // Sinhala
    'NotoSansSinhala-Regular': require('../../assets/fonts/NotoSansSinhala-Regular.ttf'),
    'NotoSansSinhala-Medium': require('../../assets/fonts/NotoSansSinhala-Medium.ttf'),
    'NotoSansSinhala-Bold': require('../../assets/fonts/NotoSansSinhala-Bold.ttf'),

    // Tamil
    'NotoSansTamil-Regular': require('../../assets/fonts/NotoSansTamil-Regular.ttf'),
    'NotoSansTamil-Medium': require('../../assets/fonts/NotoSansTamil-Medium.ttf'),
    'NotoSansTamil-Bold': require('../../assets/fonts/NotoSansTamil-Bold.ttf'),
};
