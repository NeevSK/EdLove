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
    // Gurudevi Gold - The Master Thread (Brand)
    gurudeviBlue: '#3B82F6',        // Electric Cyber Blue (Focus)
    gurudeviViolet: '#8B5CF6',      // Deep Insight (Wisdom)

    sanctuarySaffron: '#E67E22',  // Primary actions, warmth
    templeGold: '#fdd925ff',        // Elevated moments, achievements

    // Success & Growth
    sageGreen: '#8FBC8F',           // Success states, gentle growth
    mossGreen: '#556B2F',           // Subtle success backgrounds

    // Warnings & Attention
    amberGlow: '#FFB84D',           // Gentle warnings
    emberOrange: '#D35400',         // Strong warnings/secondary actions
    emberRed: '#FF6347',            // Errors (gentle, not harsh)
    skyBlue: '#87CEEB',             // Sky blue for video resources

    // Backgrounds - Light Mode (Porcelain & Ice)
    creamSilence: '#F8FAFC',        // Porcelain
    lotusWhite: '#F1F5F9',          // Ice White (secondary)
    sandStone: '#E2E8F0',           // Cool Stone (tertiary)

    // Backgrounds - Dark Mode (Bioluminescence)
    voidIndigo: '#020617',          // Midnight (Deep Void)
    deepIndigo: '#0F172A',          // Deep Navy (Layer 2)
    midnightBlue: '#1E293B',        // Card/elevated surfaces (Lighter Navy)

    // Text Colors - Light Mode
    charcoalTruth: '#0F172A',       // Deep Navy Ink
    slateGray: '#64748B',           // Slate
    stoneGray: '#94A3B8',           // Light Slate (tertiary)

    // Text Colors - Dark Mode
    sacredWhite: '#F8FAFC',         // Porcelain White
    starlightGray: '#94A3B8',       // Starlight Grey (Alias for pearlGray)
    pearlGray: '#94A3B8',           // Starlight Grey
    mistGray: '#64748B',            // Dimmed Text
    dimGray: '#475569',             // Disabled Text

    // Specialty Colors (Legacy/Accents)
    lotusDeepPink: '#DB7093',       // Lotus flower accent
    twilightPurple: '#9966CC',      // Evening/night mode accent
    twilightBlue: '#6A5ACD',        // Relational ecology accent
    lavenderMist: '#E6E6FA',        // Knowledge ecology accent
    dawnGold: '#FFD700',            // Morning/dawn accent

    // Functional Colors
    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',

    // Glass System
    glass: {
        dark: {
            surface: 'rgba(15, 23, 42, 0.6)',
            border: 'rgba(255, 255, 255, 0.1)',
            highlight: 'rgba(255, 255, 255, 0.05)',
        },
        light: {
            surface: 'rgba(255, 255, 255, 0.7)',
            border: 'rgba(255, 255, 255, 0.6)',
            highlight: 'rgba(255, 255, 255, 0.4)',
        }
    },

    // Overlays & Shadows
    shadowDark: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(148, 163, 184, 0.3)', // Cool Grey for light mode
    shadowFocus: 'rgba(59, 130, 246, 0.25)', // Blue Lift
    shadowAmbient: 'rgba(59, 130, 246, 0.15)', // Blue Ambience
    overlayDark: 'rgba(2, 6, 23, 0.8)',
    overlayLight: 'rgba(255, 255, 255, 0.9)',
} as const;

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

    // Heading Styles (Composed from base properties)
    h1: {
        fontSize: 28,      // fontSize.2xl
        lineHeight: 44.8,  // 1.6x
        fontWeight: '700', // fontWeight.bold
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 22,      // fontSize.xl
        lineHeight: 35.2,  // 1.6x
        fontWeight: '600', // fontWeight.semibold
        letterSpacing: 0,
    },
    h3: {
        fontSize: 18,      // fontSize.lg
        lineHeight: 28.8,  // 1.6x
        fontWeight: '600', // fontWeight.semibold
        letterSpacing: 0,
    },
} as const;

// ============================================================================
// SPACING - 8px Base Grid
// ============================================================================

export const spacing = {
    small: 8,    // Alias for sm
    medium: 16,   // Alias for md
    large: 24,    // Alias for lg
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
    small: 8,          // Alias for tight
    medium: 16,        // Alias for comfortable
    large: 24,         // Alias for generous
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
        shadowColor: colors.shadowAmbient,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },

    md: {
        shadowColor: colors.shadowAmbient,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 4,
    },

    lg: {
        shadowColor: colors.shadowAmbient, // Blue ambience
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 8,
    },

    xl: {
        shadowColor: colors.shadowFocus, // Stronger glow
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.8, // Higher opacity because the color is subtle blue
        shadowRadius: 24,
        elevation: 12,
    },

    // Glowing effect (for FAB, special elements)
    glow: {
        shadowColor: colors.sanctuarySaffron,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
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
