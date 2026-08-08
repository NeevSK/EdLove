/**
 * Font Configuration (Optimized)
 *
 * Using 3 font weights only (Regular, Medium, Bold) for optimal loading speed
 * Total size: ~3 MB (down from ~5 MB with 5 weights)
 *
 * Fonts are loaded via expo-font from the Expo Router root shell with lazy loading
 * - Sinhala: Abhaya Libre (Elegant serif)
 * - Tamil: Baloo Thambi 2 (Friendly rounded)
 *
 * Future: Consider variable fonts for even smaller size
 */

export const Fonts = {
  // Sinhala fonts (Abhaya Libre)
  sinhala: {
    regular: 'AbhayaLibre-Regular',
    medium: 'AbhayaLibre-Medium',
    bold: 'AbhayaLibre-Bold',
  },

  // Tamil fonts (Baloo Thambi 2)
  tamil: {
    regular: 'BalooThambi2-Regular',
    medium: 'BalooThambi2-Medium',
    bold: 'BalooThambi2-Bold',
  },

  // English/Latin fonts — Inter (body) + Poppins (headings)
  english: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },

  // Heading font (Poppins)
  heading: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-Bold',
  },
} as const;

export type FontWeight = 'regular' | 'medium' | 'bold';

/**
 * Get appropriate font family based on language
 */
export function getFontFamily(
  language: 'si' | 'ta' | 'en',
  weight: FontWeight = 'regular',
): string {
  switch (language) {
    case 'si':
      return Fonts.sinhala[weight];
    case 'ta':
      return Fonts.tamil[weight];
    default:
      return Fonts.english[weight];
  }
}

/**
 * Font loading map for expo-font
 * OPTIMIZED: Using only 3 weights (Regular, Medium, Bold)
 * Saves ~2 MB compared to 5 weights
 */
export const fontAssets = {
  // Abhaya Libre (Sinhala) - 3 weights
  'AbhayaLibre-Regular': require('@/assets/fonts/static/AbhayaLibre-Regular.ttf'),
  'AbhayaLibre-Medium': require('@/assets/fonts/static/AbhayaLibre-Medium.ttf'),
  'AbhayaLibre-Bold': require('@/assets/fonts/static/AbhayaLibre-Bold.ttf'),

  // Baloo Thambi 2 (Tamil) - 3 weights
  'BalooThambi2-Regular': require('@/assets/fonts/static/BalooThambi2-Regular.ttf'),
  'BalooThambi2-Medium': require('@/assets/fonts/static/BalooThambi2-Medium.ttf'),
  'BalooThambi2-Bold': require('@/assets/fonts/static/BalooThambi2-Bold.ttf'),

  // Inter (English body) and Poppins (Headings) — add font files to assets/fonts/static/ to enable
};
