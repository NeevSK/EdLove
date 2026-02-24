/**
 * GURUDEVI THEME SYSTEM
 * Sanctuary Design Tokens
 *
 * This file contains all design constants used throughout the app.
 * Never use hardcoded colors, spacing, or magic numbers directly in components.
 *
 * Philosophy: Every value has meaning and serves the sanctuary aesthetic.
 */

import type { TemporalPhase } from '../context/types';

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
    slateGray: '#475569',           // Darker Slate (Secondary) - Passed AA
    stoneGray: '#64748B',           // Medium Slate (Tertiary) - Passed AA

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

    // Flattened Glass Tokens (Reactive to theme/temporal phase if needed, currently static for depth)
    glassBg: 'rgba(15, 23, 42, 0.6)',      // Dark mode default
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassHighlight: 'rgba(255, 255, 255, 0.05)',

    // Overlays & Shadows
    shadowDark: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(148, 163, 184, 0.3)', // Cool Grey for light mode
    shadowFocus: 'rgba(59, 130, 246, 0.25)', // Blue Lift
    shadowAmbient: 'rgba(59, 130, 246, 0.15)', // Blue Ambience
    // Functional Semantic Aliases (Backwards Compatibility & Clarity)
    text: '#0F172A',                // charcoalTruth (Default Text)
    textPrimary: '#0F172A',         // charcoalTruth
    textSecondary: '#475569',       // slateGray
    textTertiary: '#64748B',        // stoneGray

    background: '#F8FAFC',          // creamSilence
    backgroundLight: '#F8FAFC',     // creamSilence
    backgroundDark: '#020617',      // voidIndigo

    border: '#E2E8F0',              // sandStone
    borderDark: '#1E293B',          // midnightBlue

    error: '#FF6347',               // emberRed
    errorText: '#FF6347',           // emberRed
    errorBackground: '#FFF5F5',     // Very light red (custom)

    success: '#8FBC8F',             // sageGreen
    warning: '#FFB84D',             // amberGlow

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
    md: 9,       // Standard spacing (Refined - lean but breathable)
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

// ============================================================================
// PHASE TOKEN MATRIX — The Living Theme System
// ============================================================================
// These are the ONLY color values that phase-aware components should use.
// Consume via useTheme() hook, never reference phases directly in components.

export interface GlassTokens {
    surface:  { bg: string; opacity: number; blurAmount: number; border: string };
    modal:    { bg: string; opacity: number; blurAmount: number; border: string };
    interact: { bg: string; opacity: number; blurAmount: number; border: string };
}

export interface GlowTokens {
    soft:    { color: string; radius: number; opacity: number };
    primary: { color: string; radius: number; opacity: number };
    action:  { color: string; radius: number; opacity: number };
    reward:  { color: string; radius: number; opacity: number };
}

export interface AccentTokens {
    action:  string;   // Primary interactive — buttons, links, active chips
    reward:  string;   // Achievements, celebrations, milestones
    danger:  string;   // Destructive actions
    muted:   string;   // Disabled / secondary states
}

export interface TextTokens {
    primary:   string;
    secondary: string;
    inverse:   string;  // Text on accent backgrounds
    muted:     string;
}

export interface PhaseTokens {
    gradientNodes: [string, string, string];  // AnimatedGradientMesh color nodes
    glass: GlassTokens;
    glow: GlowTokens;
    accent: AccentTokens;
    text: TextTokens;
}

/** Full matrix: phase → themeMode → resolved tokens */
export const phaseMatrix: Record<TemporalPhase, { dark: PhaseTokens; light: PhaseTokens }> = {

    predawn: {
        dark: {
            gradientNodes: ['#020617', '#0A0F1E', '#1E1B4B'],
            glass: {
                surface:  { bg: 'rgba(10,15,30,0.72)',  opacity: 0.72, blurAmount: 16, border: 'rgba(255,255,255,0.08)' },
                modal:    { bg: 'rgba(2,6,23,0.85)',    opacity: 0.85, blurAmount: 24, border: 'rgba(255,255,255,0.06)' },
                interact: { bg: 'rgba(30,27,75,0.40)',  opacity: 0.40, blurAmount: 8,  border: 'rgba(255,255,255,0.10)' },
            },
            glow: {
                soft:    { color: '#6D28D9', radius: 12, opacity: 0.15 },
                primary: { color: '#6D28D9', radius: 20, opacity: 0.35 },
                action:  { color: '#6D28D9', radius: 16, opacity: 0.50 },
                reward:  { color: '#B45309', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#7C3AED', reward: '#B45309', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#94A3B8', inverse: '#0F172A', muted: '#475569' },
        },
        light: {
            gradientNodes: ['#E8EAF6', '#F3F4F6', '#DDD6FE'],
            glass: {
                surface:  { bg: 'rgba(255,255,255,0.55)', opacity: 0.55, blurAmount: 16, border: 'rgba(0,0,0,0.08)' },
                modal:    { bg: 'rgba(255,255,255,0.70)', opacity: 0.70, blurAmount: 24, border: 'rgba(0,0,0,0.06)' },
                interact: { bg: 'rgba(255,255,255,0.35)', opacity: 0.35, blurAmount: 8,  border: 'rgba(0,0,0,0.10)' },
            },
            glow: {
                soft:    { color: '#7C3AED', radius: 10, opacity: 0.10 },
                primary: { color: '#7C3AED', radius: 18, opacity: 0.25 },
                action:  { color: '#7C3AED', radius: 14, opacity: 0.35 },
                reward:  { color: '#D97706', radius: 20, opacity: 0.45 },
            },
            accent: { action: '#7C3AED', reward: '#D97706', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#475569', inverse: '#FFFFFF', muted: '#94A3B8' },
        },
    },

    dawn: {
        dark: {
            gradientNodes: ['#0F172A', '#1E293B', '#312E81'],
            glass: {
                surface:  { bg: 'rgba(30,41,59,0.70)',  opacity: 0.70, blurAmount: 16, border: 'rgba(255,255,255,0.10)' },
                modal:    { bg: 'rgba(15,23,42,0.82)',   opacity: 0.82, blurAmount: 24, border: 'rgba(255,255,255,0.08)' },
                interact: { bg: 'rgba(49,46,129,0.35)',  opacity: 0.35, blurAmount: 8,  border: 'rgba(255,255,255,0.12)' },
            },
            glow: {
                soft:    { color: '#E67E22', radius: 12, opacity: 0.18 },
                primary: { color: '#E67E22', radius: 20, opacity: 0.40 },
                action:  { color: '#E67E22', radius: 16, opacity: 0.55 },
                reward:  { color: '#DB7093', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#E67E22', reward: '#DB7093', danger: '#EF4444', muted: '#334155' },
            text:   { primary: '#F8FAFC', secondary: '#CBD5E1', inverse: '#0F172A', muted: '#64748B' },
        },
        light: {
            gradientNodes: ['#FFF7ED', '#FFFBF5', '#FDE68A'],
            glass: {
                surface:  { bg: 'rgba(255,247,237,0.65)', opacity: 0.65, blurAmount: 16, border: 'rgba(234,88,12,0.15)' },
                modal:    { bg: 'rgba(255,251,245,0.78)', opacity: 0.78, blurAmount: 24, border: 'rgba(234,88,12,0.10)' },
                interact: { bg: 'rgba(253,230,138,0.30)', opacity: 0.30, blurAmount: 8,  border: 'rgba(234,88,12,0.20)' },
            },
            glow: {
                soft:    { color: '#EA580C', radius: 10, opacity: 0.12 },
                primary: { color: '#EA580C', radius: 20, opacity: 0.30 },
                action:  { color: '#EA580C', radius: 16, opacity: 0.40 },
                reward:  { color: '#E11D48', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#EA580C', reward: '#E11D48', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#1C0A00', secondary: '#78350F', inverse: '#FFFFFF', muted: '#A16207' },
        },
    },

    morning: {
        dark: {  // Fallback only — morning is a light phase
            gradientNodes: ['#0F172A', '#134E4A', '#064E3B'],
            glass: {
                surface:  { bg: 'rgba(6,78,59,0.50)',  opacity: 0.50, blurAmount: 16, border: 'rgba(255,255,255,0.12)' },
                modal:    { bg: 'rgba(15,23,42,0.80)',  opacity: 0.80, blurAmount: 24, border: 'rgba(255,255,255,0.10)' },
                interact: { bg: 'rgba(20,83,45,0.35)',  opacity: 0.35, blurAmount: 8,  border: 'rgba(255,255,255,0.15)' },
            },
            glow: {
                soft:    { color: '#16A34A', radius: 12, opacity: 0.20 },
                primary: { color: '#16A34A', radius: 20, opacity: 0.45 },
                action:  { color: '#16A34A', radius: 16, opacity: 0.55 },
                reward:  { color: '#EA580C', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#16A34A', reward: '#EA580C', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#86EFAC', inverse: '#0F172A', muted: '#6EE7B7' },
        },
        light: {
            gradientNodes: ['#F0F9FF', '#E0F2FE', '#DCFCE7'],
            glass: {
                surface:  { bg: 'rgba(240,249,255,0.68)', opacity: 0.68, blurAmount: 16, border: 'rgba(22,163,74,0.15)' },
                modal:    { bg: 'rgba(255,255,255,0.80)',  opacity: 0.80, blurAmount: 24, border: 'rgba(22,163,74,0.10)' },
                interact: { bg: 'rgba(220,252,231,0.45)',  opacity: 0.45, blurAmount: 8,  border: 'rgba(22,163,74,0.20)' },
            },
            glow: {
                soft:    { color: '#16A34A', radius: 10, opacity: 0.12 },
                primary: { color: '#16A34A', radius: 20, opacity: 0.28 },
                action:  { color: '#16A34A', radius: 16, opacity: 0.38 },
                reward:  { color: '#EA580C', radius: 22, opacity: 0.50 },
            },
            accent: { action: '#16A34A', reward: '#EA580C', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#166534', inverse: '#FFFFFF', muted: '#6B7280' },
        },
    },

    afternoon: {
        dark: {  // Fallback only
            gradientNodes: ['#0F172A', '#1E3A5F', '#0C4A6E'],
            glass: {
                surface:  { bg: 'rgba(14,36,95,0.55)',  opacity: 0.55, blurAmount: 16, border: 'rgba(255,255,255,0.12)' },
                modal:    { bg: 'rgba(15,23,42,0.82)',   opacity: 0.82, blurAmount: 24, border: 'rgba(255,255,255,0.10)' },
                interact: { bg: 'rgba(2,132,199,0.30)',  opacity: 0.30, blurAmount: 8,  border: 'rgba(255,255,255,0.15)' },
            },
            glow: {
                soft:    { color: '#0284C7', radius: 12, opacity: 0.20 },
                primary: { color: '#0284C7', radius: 20, opacity: 0.45 },
                action:  { color: '#0284C7', radius: 16, opacity: 0.55 },
                reward:  { color: '#D97706', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#0284C7', reward: '#D97706', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#BAE6FD', inverse: '#0F172A', muted: '#7DD3FC' },
        },
        light: {
            gradientNodes: ['#FAFAFA', '#F1F5F9', '#E0F2FE'],
            glass: {
                surface:  { bg: 'rgba(255,255,255,0.72)', opacity: 0.72, blurAmount: 16, border: 'rgba(2,132,199,0.12)' },
                modal:    { bg: 'rgba(255,255,255,0.85)', opacity: 0.85, blurAmount: 24, border: 'rgba(2,132,199,0.08)' },
                interact: { bg: 'rgba(224,242,254,0.50)', opacity: 0.50, blurAmount: 8,  border: 'rgba(2,132,199,0.18)' },
            },
            glow: {
                soft:    { color: '#0284C7', radius: 10, opacity: 0.10 },
                primary: { color: '#0284C7', radius: 18, opacity: 0.25 },
                action:  { color: '#0284C7', radius: 14, opacity: 0.35 },
                reward:  { color: '#D97706', radius: 20, opacity: 0.48 },
            },
            accent: { action: '#0284C7', reward: '#D97706', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#475569', inverse: '#FFFFFF', muted: '#94A3B8' },
        },
    },

    dusk: {
        dark: {
            gradientNodes: ['#0C1A2E', '#0E2A4A', '#134E7A'],
            glass: {
                surface:  { bg: 'rgba(14,42,74,0.70)',  opacity: 0.70, blurAmount: 16, border: 'rgba(14,165,233,0.15)' },
                modal:    { bg: 'rgba(12,26,46,0.85)',  opacity: 0.85, blurAmount: 24, border: 'rgba(14,165,233,0.10)' },
                interact: { bg: 'rgba(20,78,122,0.40)', opacity: 0.40, blurAmount: 8,  border: 'rgba(14,165,233,0.20)' },
            },
            glow: {
                soft:    { color: '#0EA5E9', radius: 14, opacity: 0.20 },
                primary: { color: '#0EA5E9', radius: 22, opacity: 0.45 },
                action:  { color: '#0EA5E9', radius: 18, opacity: 0.60 },
                reward:  { color: '#F97316', radius: 26, opacity: 0.70 },
            },
            accent: { action: '#0EA5E9', reward: '#F97316', danger: '#EF4444', muted: '#334155' },
            text:   { primary: '#F0F9FF', secondary: '#BAE6FD', inverse: '#0C1A2E', muted: '#7DD3FC' },
        },
        light: {  // Fallback only — dusk is a dark phase
            gradientNodes: ['#FFF7ED', '#FEE2E2', '#FECACA'],
            glass: {
                surface:  { bg: 'rgba(255,247,237,0.65)', opacity: 0.65, blurAmount: 16, border: 'rgba(249,115,22,0.15)' },
                modal:    { bg: 'rgba(255,255,255,0.78)',  opacity: 0.78, blurAmount: 24, border: 'rgba(249,115,22,0.10)' },
                interact: { bg: 'rgba(254,226,226,0.40)',  opacity: 0.40, blurAmount: 8,  border: 'rgba(249,115,22,0.20)' },
            },
            glow: {
                soft:    { color: '#F97316', radius: 10, opacity: 0.12 },
                primary: { color: '#F97316', radius: 20, opacity: 0.30 },
                action:  { color: '#F97316', radius: 16, opacity: 0.40 },
                reward:  { color: '#0EA5E9', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#F97316', reward: '#0EA5E9', danger: '#DC2626', muted: '#9CA3AF' },
            text:   { primary: '#0F172A', secondary: '#9A3412', inverse: '#FFFFFF', muted: '#6B7280' },
        },
    },

    night: {
        dark: {
            gradientNodes: ['#020617', '#0F172A', '#1E1B4B'],
            glass: {
                surface:  { bg: 'rgba(15,23,42,0.72)',  opacity: 0.72, blurAmount: 16, border: 'rgba(253,217,37,0.08)' },
                modal:    { bg: 'rgba(2,6,23,0.88)',    opacity: 0.88, blurAmount: 24, border: 'rgba(253,217,37,0.06)' },
                interact: { bg: 'rgba(30,27,75,0.42)',  opacity: 0.42, blurAmount: 8,  border: 'rgba(253,217,37,0.12)' },
            },
            glow: {
                soft:    { color: '#FDD925', radius: 14, opacity: 0.18 },
                primary: { color: '#FDD925', radius: 24, opacity: 0.42 },
                action:  { color: '#FDD925', radius: 18, opacity: 0.58 },
                reward:  { color: '#8B5CF6', radius: 28, opacity: 0.70 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#EF4444', muted: '#374151' },
            text:   { primary: '#F8FAFC', secondary: '#E2E8F0', inverse: '#020617', muted: '#64748B' },
        },
        light: {  // Fallback only — night is a dark phase
            gradientNodes: ['#1E1B4B', '#312E81', '#4338CA'],
            glass: {
                surface:  { bg: 'rgba(49,46,129,0.30)', opacity: 0.30, blurAmount: 16, border: 'rgba(253,217,37,0.20)' },
                modal:    { bg: 'rgba(30,27,75,0.45)',  opacity: 0.45, blurAmount: 24, border: 'rgba(253,217,37,0.15)' },
                interact: { bg: 'rgba(67,56,202,0.25)', opacity: 0.25, blurAmount: 8,  border: 'rgba(253,217,37,0.25)' },
            },
            glow: {
                soft:    { color: '#FDD925', radius: 12, opacity: 0.15 },
                primary: { color: '#FDD925', radius: 22, opacity: 0.35 },
                action:  { color: '#FDD925', radius: 16, opacity: 0.45 },
                reward:  { color: '#8B5CF6', radius: 24, opacity: 0.55 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#EF4444', muted: '#6B7280' },
            text:   { primary: '#F8FAFC', secondary: '#C7D2FE', inverse: '#1E1B4B', muted: '#818CF8' },
        },
    },
};

/** The single resolver — this is what all components call via useTheme() */
export function resolvePhaseTokens(
    phase: TemporalPhase,
    isDark: boolean
): PhaseTokens {
    return phaseMatrix[phase][isDark ? 'dark' : 'light'];
}
