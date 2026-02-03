/**
 * GURUDEVI THEME SYSTEM
 * Sanctuary Design Tokens
 * 
 * This file contains all design constants used throughout the app.
 * Never use hardcoded colors, spacing, or magic numbers directly in components.
 * 
 * Philosophy: Every value has meaning and serves the sanctuary aesthetic.
 */

// ============================================================================
// COLORS - Sanctuary Palette
// ============================================================================

export const colors = {
    // Primary Actions & Highlights
    sanctuarySaffron: '#E67E22',    // Primary action color (warm, energizing)

    // Success & Growth
    sageGreen: '#8FBC8F',           // Success states, gentle growth
    mossGreen: '#556B2F',           // Subtle success backgrounds

    // Warnings & Attention
    amberGlow: '#FFB84D',           // Gentle warnings
    emberRed: '#FF6347',            // Errors (gentle, not harsh)

    // Backgrounds - Light Mode
    creamSilence: '#FFF8E7',        // Primary light background
    lotusWhite: '#FAF5F0',          // Secondary light background
    sandStone: '#E8DCC8',           // Tertiary light background

    // Backgrounds - Dark Mode (primary)
    voidIndigo: '#0f0f1e',          // Primary dark background
    deepIndigo: '#1a1a2e',          // Secondary dark background
    midnightBlue: '#16213e',        // Card/elevated surfaces

    // Text Colors - Light Mode
    charcoalTruth: '#2C3E50',       // Primary text on light
    slateGray: '#546E7A',           // Secondary text on light
    stoneGray: '#90A4AE',           // Tertiary text on light

    // Text Colors - Dark Mode
    sacredWhite: '#FFF8F0',         // Primary text on dark
    pearlGray: '#E0E0E0',           // Secondary text on dark
    mistGray: '#B0B0B0',            // Tertiary text on dark
    dimGray: '#666666',             // Disabled text

    // Specialty Colors
    lotusDeepPink: '#DB7093',       // Lotus flower accent
    twilightPurple: '#9966CC',      // Evening/night mode accent
    dawnGold: '#FFD700',            // Morning/dawn accent

    // Functional Colors
    transparent: 'transparent',
    white: '#FFFFFF',               // Use sparingly (pure white harsh on eyes)
    black: '#000000',               // Use sparingly (pure black harsh on eyes)

    // Overlays & Shadows
    shadowDark: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    overlayDark: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(255, 255, 255, 0.9)',
};

// ============================================================================
// TYPOGRAPHY - Readable & Respectful
// ============================================================================

export const typography = {
    // Font Families (will be set after fonts load)
    fontFamily: {
        sinhala: 'NotoSansSinhala',
        tamil: 'NotoSansTamil',
        english: 'System',              // Use system default for English
    },

    // Font Sizes (minimum 14sp per accessibility guidelines)
    fontSize: {
        xs: 12,      // Captions, timestamps (use sparingly)
        sm: 14,      // Small labels, helper text
        md: 16,      // Button text, input labels
        lg: 18,      // Body text (DEFAULT - never smaller)
        xl: 22,      // Section headings
        '2xl': 28,   // Page headings
        '3xl': 36,   // Large headings
        '4xl': 48,   // Hero text
        '5xl': 64,   // Display text
    },

    // Line Heights (1.6x for Sinhala/Tamil readability)
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.6,   // DEFAULT for body text
        loose: 1.8,     // For Sinhala/Tamil (more vertical space)
    },

    // Font Weights
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    // Letter Spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
};

// ============================================================================
// SPACING - 8px Base Grid
// ============================================================================

export const spacing = {
    xs: 4,       // Tight spacing (icon padding, small gaps)
    sm: 8,       // Small spacing (between related items)
    md: 16,      // Standard spacing (DEFAULT - most common)
    lg: 24,      // Large spacing (section gaps)
    xl: 32,      // Extra large (page margins, major sections)
    '2xl': 48,   // Huge spacing (page padding)
    '3xl': 64,   // Massive spacing (hero sections)
};

// ============================================================================
// CORNER RADIUS - Organic, Never Sharp
// ============================================================================

export const corners = {
    tight: 8,          // Small elements (chips, badges)
    comfortable: 16,   // Buttons, inputs (DEFAULT)
    generous: 24,      // Cards, modals
    full: 9999,        // Circular (FAB, avatars) - use large number for full rounding
};

// ============================================================================
// SHADOWS - Soft & Sanctuary
// ============================================================================

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },

    sm: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },

    xl: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },

    // Glowing effect (for FAB, special elements)
    glow: {
        shadowColor: colors.sanctuarySaffron,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
};

// ============================================================================
// MOTION - Breath-like Timing
// ============================================================================

export const motion = {
    // Duration (in milliseconds)
    instant: 100,      // Rarely used (immediate feedback only)
    quick: 200,        // Fast transitions (hover, focus)
    standard: 300,     // Default animation speed
    gentle: 500,       // Meditative pace
    breathing: 4000,   // Lotus companion breathing cycle

    // Easing (use spring physics for organic feel)
    easing: {
        // These are descriptive names - actual implementation uses react-native-reanimated
        spring: 'spring',           // Default - organic, bouncy
        linear: 'linear',           // Avoid - feels robotic
        easeIn: 'ease-in',         // Accelerating
        easeOut: 'ease-out',       // Decelerating (good for exit)
        easeInOut: 'ease-in-out',  // Smooth both ends
    },

    // Spring Physics (for react-native-reanimated)
    spring: {
        gentle: {
            damping: 15,
            stiffness: 150,
        },
        bouncy: {
            damping: 10,
            stiffness: 200,
        },
        snappy: {
            damping: 20,
            stiffness: 300,
        },
    },
};

// ============================================================================
// BORDERS
// ============================================================================

export const borders = {
    width: {
        none: 0,
        thin: 1,
        medium: 2,
        thick: 4,
    },

    style: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
    },
};

// ============================================================================
// OPACITY LEVELS
// ============================================================================

export const opacity = {
    transparent: 0,
    subtle: 0.1,
    light: 0.3,
    medium: 0.5,
    strong: 0.7,
    heavy: 0.9,
    opaque: 1,
};

// ============================================================================
// Z-INDEX LAYERS (Stacking Order)
// ============================================================================

export const zIndex = {
    background: 0,
    content: 1,
    elevated: 10,      // Cards, raised content
    dropdown: 100,     // Dropdowns, popovers
    sticky: 200,       // Sticky headers
    fab: 300,          // Floating action button
    modal: 400,        // Modals, dialogs
    toast: 500,        // Toasts, notifications
    tooltip: 600,      // Tooltips
};

// ============================================================================
// DEFAULT EXPORT - Complete Theme Object
// ============================================================================

export const Theme = {
    colors,
    typography,
    spacing,
    corners,
    shadows,
    motion,
    borders,
    opacity,
    zIndex,
};

export default Theme;
