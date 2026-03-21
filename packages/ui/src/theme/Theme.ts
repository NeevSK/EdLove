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
import { compositeColorOverBackground, getTextOnBackground } from '../utils/colorUtils';

// ============================================================================
// COLORS - Sanctuary Palette
// ============================================================================

export const colors = {
    // Primary Actions & Highlights
    // Gurudevi Gold - The Master Thread (Brand)
    gurudeviBlue: '#2563EB',        // Electric Cyber Blue (Focus) - higher contrast
    gurudeviViolet: '#8B5CF6',      // Deep Insight (Wisdom)

    sanctuarySaffron: '#F6BF8C',    // Primary actions, warmth (Vibrant Saffron per Design Retina)
    saffronMuted: '#C4956A',        // Secondary usage, morning mist
    templeGold: '#FDD925',          // Elevated moments, achievements
    amberGlow: '#FFB84D',           // Gentle warnings

    // Success & Growth
    sageGreen: '#8BBF7A',           // Success states, gentle growth (daluGreen per Design Retina)
    mossGreen: '#556B2F',           // Subtle success backgrounds

    // Warnings & Attention
    emberOrange: '#D35400',         // Strong warnings/secondary actions
    emberRed: '#FF6347',            // Errors (gentle, not harsh)
    skyBlue: '#87CEEB',             // Sky blue for video resources

    // Backgrounds - The Light World (Vellum & Silk)
    vellum: '#F5EDD6',              // The Ground (Base)
    silk: '#FAF7ED',                // The Surface (Secondary)
    linen: '#E8E2CF',               // The Depth (Tertiary)
    // Circadian gradient intermediates (dawn warm-white & evening warm-beige)
    dawnWhite: '#FAF3E0',           // Dawn transition — between silk and vellum
    eveningWarm: '#F0E8D0',         // Evening transition — between vellum and linen

    // Backgrounds - The Dark World (Bioluminescence)
    ink: '#2A2318',                 // Midnight Ink (Deep Base)
    obsidian: '#1A1610',            // The Void (Deeper Shadow)
    shroud: '#3D3528',              // Elevated Surfaces (Darker Navy equivalent)

    // Text Colors - Light Mode
    inkTruth: '#2A2318',            // Deep Ink (Primary Text)
    bark: '#544A3D',                // Secondary Text
    willow: '#72695E',              // The Shadow (Muted) — Adjusted from #72695E for WCAG AA

    // Text Colors - Dark Mode (higher contrast for accessibility)
    sacredWhite: '#FCF9F2',         // Bone/Sacred White
    starlightGray: '#C8BFB0',       // Starlight (Secondary) - lightened for APCA 60+ contrast
    mistGray: '#968E80',            // Dimmed Text - lightened for better contrast
    dimGray: '#6A6358',             // Disabled Text

    // Specialty Colors
    shadowViolet: '#6B6480',        // The ONLY Shadow Base
    lotusDeepPink: '#DA70D6',       // Lotus flower accent
    twilightBlue: '#6A5ACD',        // Relational ecology accent
    saffron: '#F6BF8C',             // Canonical Saffron
    saffronWhisper: '#F0D4B0',      // Barely there warmth

    // Social Brand Colors
    whatsapp: '#25D366',
    linkedin: '#0077B5',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    portfolio: '#2A2318',           // Linktree/Portfolio (Dark base)

    // Functional Colors
    transparent: 'transparent',
    white: '#FCF9F2',               // REDEFINED: Pure White is forbidden, use Sacred White
    black: '#1A1610',               // REDEFINED: Pure Black is forbidden, use Obsidian

    // Glass System - Glass Protocol (Frosted/Thin/Dense)
    glass: {
        dark: {
            surface: 'rgba(42, 35, 24, 0.72)', // Ink based
            border: 'rgba(252, 249, 242, 0.12)', // Sacred White based
            highlight: 'rgba(252, 249, 242, 0.08)',
        },
        light: {
            surface: 'rgba(245, 237, 214, 0.72)', // Vellum based
            border: 'rgba(42, 35, 24, 0.12)',      // Ink based
            highlight: 'rgba(42, 35, 24, 0.08)',
        }
    },

    // Overlays & Shadows - Shadow Law
    shadowAmbient: 'rgba(107, 100, 128, 0.12)', // Shadow Violet @ 12%
    shadowDeep: 'rgba(107, 100, 128, 0.24)',    // Shadow Violet @ 24%
    shadowFocus: 'rgba(246, 191, 140, 0.15)',    // Saffron glow (#F6BF8C based)
    shadowSaffron: 'rgba(246, 191, 140, 0.4)',  // Stronger Saffron glow

    // Resonance System - Phase Tints
    resonance: {
        past: '#968E80',    // Muted Sepia-Grey (History)
        present: '#F6BF8C', // Sanctuary Saffron (Living)
        future: '#FDD925',  // Temple Gold (Potential)
        ghost: 'rgba(150, 142, 128, 0.4)', // Faded historical resonance
    },

    // Functional Semantic Aliases
    text: '#2A2318',                // inkTruth
    textPrimary: '#2A2318',
    textSecondary: '#544A3D',       // bark
    textTertiary: '#72695E',        // willow

    background: '#F5EDD6',          // vellum
    backgroundLight: '#F5EDD6',
    backgroundDark: '#2A2318',      // ink

    border: '#E8E2CF',              // linen
    borderDark: '#3D3528',          // shroud

    error: '#FF6347',               // emberRed
    errorText: '#FF6347',
    errorBackground: '#FFF0EE',

    success: '#8BBF7A',             // sageGreen
    warning: '#FFB84D',             // amberGlow
    glassBorder: 'rgba(252, 249, 242, 0.12)', // Sacred White based (Default)
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

const shadowDefinitions = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        boxShadow: 'none',
    },

    sm: {
        shadowColor: colors.shadowAmbient,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
        boxShadow: '0 2px 4px rgba(107, 100, 128, 0.12)',
    },

    md: {
        shadowColor: colors.shadowAmbient,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
        boxShadow: '0 4px 8px rgba(107, 100, 128, 0.12)',
    },

    lg: {
        shadowColor: colors.shadowDeep,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 8,
        boxShadow: '0 8px 16px rgba(107, 100, 128, 0.24)',
    },

    xl: {
        shadowColor: colors.shadowDeep,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 12,
        boxShadow: '0 12px 24px rgba(107, 100, 128, 0.24)',
    },

    // Glowing effect (for FAB, special elements)
    glow: {
        shadowColor: '#F6BF8C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
        boxShadow: '0 0 20px rgba(246, 191, 140, 0.6)',
    },
};

const isWeb = typeof window !== 'undefined';

export const shadows: typeof shadowDefinitions = Object.entries(shadowDefinitions).reduce((acc, [key, value]) => {
    // @ts-ignore
    acc[key] = (isWeb && value.boxShadow) ? { boxShadow: value.boxShadow } : value;
    return acc;
}, {} as any);

/**
 * Filter shadow props for web to avoid deprecation warnings.
 * Usage: <View style={{ ...Theme.spacing.md, ...getShadowStyle(Theme.shadows.md) }} />
 */
export const getShadowStyle = (shadow: any) => {
    if (typeof window !== 'undefined' || (typeof process !== 'undefined' && process.env.BROWSER)) {
        // On web, just return boxShadow if it exists
        if (shadow.boxShadow) {
            return { boxShadow: shadow.boxShadow };
        }
    }
    return shadow;
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
// LIST DIMENSIONS - For FlashList Optimization
// ============================================================================

export const listSizes = {
    resourceRow: 80,
    communityCard: 120,
    chatMessage: 100,
    classroomRow: 64,
    groupItem: 72,
} as const;

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
    listSizes,
};

export default Theme;

// ============================================================================
// PHASE TOKEN MATRIX — The Living Theme System
// ============================================================================
// These are the ONLY color values that phase-aware components should use.
// Consume via useTheme() hook, never reference phases directly in components.

export interface GlassTokens {
    surface: { bg: string; opacity: number; blurAmount: number; border: string };
    modal: { bg: string; opacity: number; blurAmount: number; border: string };
    interact: { bg: string; opacity: number; blurAmount: number; border: string };
}

export interface GlowTokens {
    soft: { color: string; radius: number; opacity: number };
    primary: { color: string; radius: number; opacity: number };
    action: { color: string; radius: number; opacity: number };
    reward: { color: string; radius: number; opacity: number };
}

export interface AccentTokens {
    action: string;   // Primary interactive — buttons, links, active chips
    reward: string;   // Achievements, celebrations, milestones
    danger: string;   // Destructive actions
    muted: string;   // Disabled / secondary states
}

export interface TextTokens {
    primary: string;
    secondary: string;
    inverse: string;  // Text on accent backgrounds
    muted: string;
}

export interface PhaseTokens {
    gradientNodes: [string, string, string];  // AnimatedGradientMesh color nodes
    glass: GlassTokens;
    glow: GlowTokens;
    accent: AccentTokens;
    text: TextTokens;
}

export type ThemeProfile = 'sanctuary';

export interface SceneLayerToken {
    bg: string;
    border: string;
}

export interface SceneTokens {
    world: SceneLayerToken;
    chrome: SceneLayerToken;
    canvas: SceneLayerToken;
    surface: SceneLayerToken;
    elevated: SceneLayerToken;
    interactive: SceneLayerToken;
}

export interface SceneTextTokens {
    onWorld: string;
    onChrome: string;
    onCanvas: string;
    onSurface: string;
    onElevated: string;
    onInteractive: string;
    onAccent: string;
    onDanger: string;
}

export interface ResolvedThemeTokens extends Omit<PhaseTokens, 'text'> {
    profile: ThemeProfile;
    scene: SceneTokens;
    text: TextTokens & SceneTextTokens;
}

function resolveSceneText(bg: string, base: string, fallback: string): string {
    try {
        const effectiveBg = bg.startsWith('#')
            ? bg
            : compositeColorOverBackground(bg, base);

        return getTextOnBackground(effectiveBg, colors.inkTruth, colors.sacredWhite);
    } catch {
        return fallback;
    }
}

function createSceneTokens(tokens: PhaseTokens): SceneTokens {
    return {
        world: { bg: tokens.gradientNodes[0], border: 'transparent' },
        chrome: { bg: tokens.glass.surface.bg, border: tokens.glass.surface.border },
        canvas: { bg: tokens.gradientNodes[1], border: tokens.glass.surface.border },
        surface: { bg: tokens.glass.surface.bg, border: tokens.glass.surface.border },
        elevated: { bg: tokens.glass.modal.bg, border: tokens.glass.modal.border },
        interactive: { bg: tokens.glass.interact.bg, border: tokens.glass.interact.border },
    };
}

function enrichThemeTokens(
    tokens: PhaseTokens,
    profile: ThemeProfile = 'sanctuary'
): ResolvedThemeTokens {
    const scene = createSceneTokens(tokens);
    const sceneText: SceneTextTokens = {
        onWorld: resolveSceneText(scene.world.bg, scene.world.bg, tokens.text.primary),
        onChrome: resolveSceneText(scene.chrome.bg, scene.world.bg, tokens.text.primary),
        onCanvas: resolveSceneText(scene.canvas.bg, scene.world.bg, tokens.text.primary),
        onSurface: resolveSceneText(scene.surface.bg, scene.canvas.bg, tokens.text.primary),
        onElevated: resolveSceneText(scene.elevated.bg, scene.canvas.bg, tokens.text.primary),
        onInteractive: resolveSceneText(scene.interactive.bg, scene.surface.bg, tokens.text.primary),
        onAccent: getTextOnBackground(tokens.accent.action, colors.inkTruth, colors.sacredWhite),
        onDanger: getTextOnBackground(tokens.accent.danger, colors.inkTruth, colors.sacredWhite),
    };

    return {
        ...tokens,
        profile,
        scene,
        text: {
            ...tokens.text,
            ...sceneText,
            inverse: sceneText.onAccent,
        },
    };
}

/** Full matrix: phase → themeMode → resolved tokens */
export const phaseMatrix: Record<TemporalPhase, { dark: PhaseTokens; light: PhaseTokens }> = {

    predawn: {
        dark: {
            gradientNodes: ['#11141B', '#171C27', '#232B3B'], // Obsidian → Ink → Shroud
            glass: {
                surface: { bg: 'rgba(23, 28, 39, 0.94)', opacity: 0.94, blurAmount: 28, border: 'rgba(232,235,255,0.10)' },
                modal: { bg: 'rgba(17, 20, 27, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(232,235,255,0.07)' },
                interact: { bg: 'rgba(35, 43, 59, 0.40)', opacity: 0.40, blurAmount: 8, border: 'rgba(232,235,255,0.14)' },
            },
            glow: {
                soft: { color: '#6B6480', radius: 12, opacity: 0.15 },
                primary: { color: '#F6BF8C', radius: 20, opacity: 0.35 },
                action: { color: '#F6BF8C', radius: 16, opacity: 0.50 },
                reward: { color: '#FDD925', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#F6BF8C', reward: '#FDD925', danger: '#FF6347', muted: '#394458' },
            text: { primary: '#FCF9F2', secondary: '#D3D8E3', inverse: '#11141B', muted: '#9AA3B5' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#FAF7ED', '#E8E2CF'], // Vellum → Silk → Linen
            glass: {
                surface: { bg: 'rgba(250, 247, 237, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(42,35,24,0.05)' },
                modal: { bg: 'rgba(245, 237, 214, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(42,35,24,0.04)' },
                interact: { bg: 'rgba(232, 226, 207, 0.50)', opacity: 0.50, blurAmount: 8, border: 'rgba(42,35,24,0.08)' },
            },
            glow: {
                soft: { color: '#6B6480', radius: 10, opacity: 0.10 },
                primary: { color: '#F6BF8C', radius: 18, opacity: 0.25 },
                action: { color: '#F6BF8C', radius: 14, opacity: 0.35 },
                reward: { color: '#FDD925', radius: 20, opacity: 0.45 },
            },
            accent: { action: '#F6BF8C', reward: '#FDD925', danger: '#FF6347', muted: '#72695E' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
        },
    },

    dawn: {
        dark: {
            gradientNodes: ['#151922', '#1D2430', '#2A3344'],
            glass: {
                surface: { bg: 'rgba(29, 36, 48, 0.94)', opacity: 0.94, blurAmount: 28, border: 'rgba(232,235,255,0.11)' },
                modal: { bg: 'rgba(21, 25, 34, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(232,235,255,0.08)' },
                interact: { bg: 'rgba(42, 51, 68, 0.38)', opacity: 0.38, blurAmount: 8, border: 'rgba(232,235,255,0.15)' },
            },
            glow: {
                soft: { color: '#F6BF8C', radius: 12, opacity: 0.18 },
                primary: { color: '#F6BF8C', radius: 20, opacity: 0.40 },
                action: { color: '#F6BF8C', radius: 16, opacity: 0.55 },
                reward: { color: '#DA70D6', radius: 24, opacity: 0.60 },
            },
            accent: { action: '#F6BF8C', reward: '#DA70D6', danger: '#FF6347', muted: '#3F4A61' },
            text: { primary: '#FCF9F2', secondary: '#D3D8E3', inverse: '#151922', muted: '#9AA3B5' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#FFFBF5', '#FAF7ED'], // Vellum -> Silk -> Silk (Warm light)
            glass: {
                surface: { bg: 'rgba(245, 237, 214, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(246,191,140,0.10)' },
                modal: { bg: 'rgba(250, 247, 237, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(246,191,140,0.08)' },
                interact: { bg: 'rgba(242, 217, 37, 0.50)', opacity: 0.50, blurAmount: 8, border: 'rgba(246,191,140,0.15)' },
            },
            glow: {
                soft: { color: '#F6BF8C', radius: 10, opacity: 0.12 },
                primary: { color: '#F6BF8C', radius: 20, opacity: 0.30 },
                action: { color: '#F6BF8C', radius: 16, opacity: 0.40 },
                reward: { color: '#DA70D6', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#F6BF8C', reward: '#DA70D6', danger: '#FF6347', muted: '#72695E' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
        },
    },

    morning: {
        dark: {
            gradientNodes: ['#171C25', '#202838', '#2D3A4F'],
            glass: {
                surface: { bg: 'rgba(32, 40, 56, 0.94)', opacity: 0.94, blurAmount: 28, border: 'rgba(232,235,255,0.12)' },
                modal: { bg: 'rgba(23, 28, 37, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(232,235,255,0.09)' },
                interact: { bg: 'rgba(45, 58, 79, 0.40)', opacity: 0.40, blurAmount: 8, border: 'rgba(232,235,255,0.16)' },
            },
            glow: {
                soft: { color: '#8FBC8F', radius: 12, opacity: 0.20 },
                primary: { color: '#8FBC8F', radius: 20, opacity: 0.45 },
                action: { color: '#8FBC8F', radius: 16, opacity: 0.55 },
                reward: { color: '#F6BF8C', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#8BBF7A', reward: '#F6BF8C', danger: '#FF6347', muted: '#43506A' },
            text: { primary: '#FCF9F2', secondary: '#D4DAE5', inverse: '#171C25', muted: '#A0A9BC' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#DCFCE7', '#FAF7ED'],
            glass: {
                surface: { bg: 'rgba(245, 237, 214, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(143,188,143,0.10)' },
                modal: { bg: 'rgba(250, 247, 237, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(143,188,143,0.08)' },
                interact: { bg: 'rgba(220,252,231,0.60)', opacity: 0.60, blurAmount: 8, border: 'rgba(143,188,143,0.15)' },
            },
            glow: {
                soft: { color: '#8FBC8F', radius: 10, opacity: 0.12 },
                primary: { color: '#8FBC8F', radius: 20, opacity: 0.28 },
                action: { color: '#8FBC8F', radius: 16, opacity: 0.38 },
                reward: { color: '#F6BF8C', radius: 22, opacity: 0.50 },
            },
            accent: { action: '#8BBF7A', reward: '#F6BF8C', danger: '#FF6347', muted: '#72695E' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#2A2318', muted: '#72695E' },
        },
    },

    afternoon: {
        dark: {
            gradientNodes: ['#151B26', '#1F2A3B', '#2E4060'],
            glass: {
                surface: { bg: 'rgba(31, 42, 59, 0.94)', opacity: 0.94, blurAmount: 28, border: 'rgba(232,235,255,0.10)' },
                modal: { bg: 'rgba(21, 27, 38, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(232,235,255,0.08)' },
                interact: { bg: 'rgba(46, 64, 96, 0.36)', opacity: 0.36, blurAmount: 8, border: 'rgba(232,235,255,0.14)' },
            },
            glow: {
                soft: { color: '#3B82F6', radius: 12, opacity: 0.20 },
                primary: { color: '#3B82F6', radius: 20, opacity: 0.45 },
                action: { color: '#3B82F6', radius: 16, opacity: 0.55 },
                reward: { color: '#FDD925', radius: 24, opacity: 0.65 },
            },
            accent: { action: '#2563EB', reward: '#FDD925', danger: '#FF6347', muted: '#3E4F71' },
            text: { primary: '#FCF9F2', secondary: '#D4DAE5', inverse: '#151B26', muted: '#9FAABD' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#E0F2FE', '#F5EDD6'],
            glass: {
                surface: { bg: 'rgba(245, 237, 214, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(59,130,246,0.10)' },
                modal: { bg: 'rgba(250, 247, 237, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(59,130,246,0.06)' },
                interact: { bg: 'rgba(224,242,254,0.65)', opacity: 0.65, blurAmount: 8, border: 'rgba(59,130,246,0.15)' },
            },
            glow: {
                soft: { color: '#3B82F6', radius: 10, opacity: 0.10 },
                primary: { color: '#3B82F6', radius: 18, opacity: 0.25 },
                action: { color: '#3B82F6', radius: 14, opacity: 0.35 },
                reward: { color: '#FDD925', radius: 20, opacity: 0.48 },
            },
            accent: { action: '#2563EB', reward: '#FDD925', danger: '#FF6347', muted: '#72695E' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
        },
    },

    dusk: {
        dark: {
            gradientNodes: ['#151822', '#201F35', '#302A4A'],
            glass: {
                surface: { bg: 'rgba(32, 31, 53, 0.94)', opacity: 0.94, blurAmount: 28, border: 'rgba(232,235,255,0.10)' },
                modal: { bg: 'rgba(21, 24, 34, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(232,235,255,0.07)' },
                interact: { bg: 'rgba(48, 42, 74, 0.40)', opacity: 0.40, blurAmount: 8, border: 'rgba(232,235,255,0.14)' },
            },
            glow: {
                soft: { color: '#F6BF8C', radius: 14, opacity: 0.20 },
                primary: { color: '#F6BF8C', radius: 22, opacity: 0.45 },
                action: { color: '#F6BF8C', radius: 18, opacity: 0.60 },
                reward: { color: '#DA70D6', radius: 26, opacity: 0.70 },
            },
            accent: { action: '#F6BF8C', reward: '#DA70D6', danger: '#FF6347', muted: '#473E68' },
            text: { primary: '#FCF9F2', secondary: '#D7DBE8', inverse: '#151822', muted: '#A39DBB' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#FFF7ED', '#FAF7ED'],
            glass: {
                surface: { bg: 'rgba(245, 237, 214, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(246,191,140,0.12)' },
                modal: { bg: 'rgba(250, 247, 237, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(246,191,140,0.10)' },
                interact: { bg: 'rgba(255, 247, 237, 0.60)', opacity: 0.60, blurAmount: 8, border: 'rgba(246,191,140,0.15)' },
            },
            glow: {
                soft: { color: '#F6BF8C', radius: 10, opacity: 0.12 },
                primary: { color: '#F6BF8C', radius: 20, opacity: 0.30 },
                action: { color: '#F6BF8C', radius: 16, opacity: 0.40 },
                reward: { color: '#DA70D6', radius: 22, opacity: 0.45 },
            },
            accent: { action: '#F6BF8C', reward: '#DA70D6', danger: '#FF6347', muted: '#72695E' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
        },
    },

    night: {
        dark: {
            gradientNodes: ['#0F131C', '#171E2B', '#242F46'],
            glass: {
                surface: { bg: 'rgba(23, 30, 43, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(253,217,37,0.08)' },
                modal: { bg: 'rgba(15, 19, 28, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(253,217,37,0.06)' },
                interact: { bg: 'rgba(36, 47, 70, 0.42)', opacity: 0.42, blurAmount: 8, border: 'rgba(253,217,37,0.12)' },
            },
            glow: {
                soft: { color: '#FDD925', radius: 14, opacity: 0.18 },
                primary: { color: '#FDD925', radius: 24, opacity: 0.42 },
                action: { color: '#FDD925', radius: 18, opacity: 0.58 },
                reward: { color: '#8B5CF6', radius: 28, opacity: 0.70 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#FF6347', muted: '#3E4C67' },
            text: { primary: '#FCF9F2', secondary: '#D8DDE9', inverse: '#0F131C', muted: '#A0A9BE' },
        },
        light: {
            gradientNodes: ['#F5EDD6', '#FAF7ED', '#E8E2CF'], // Night Light: Vellum -> Silk -> Linen (Never black)
            glass: {
                surface: { bg: 'rgba(245, 237, 214, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(253,217,37,0.18)' },
                modal: { bg: 'rgba(250, 247, 237, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(253,217,37,0.12)' },
                interact: { bg: 'rgba(232, 226, 207, 0.60)', opacity: 0.60, blurAmount: 8, border: 'rgba(253,217,37,0.20)' },
            },
            glow: {
                soft: { color: '#FDD925', radius: 12, opacity: 0.15 },
                primary: { color: '#FDD925', radius: 22, opacity: 0.35 },
                action: { color: '#FDD925', radius: 16, opacity: 0.45 },
                reward: { color: '#8B5CF6', radius: 24, opacity: 0.55 },
            },
            accent: { action: '#FDD925', reward: '#8B5CF6', danger: '#FF6347', muted: '#524A3F' },
            text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
        },
    },
};

/**
 * Classic static tokens — fallback when Living Theme System is disabled.
 * Derived from the original Theme.colors palette.
 * Used by useTheme() when enableLivingTheme = false.
 *
 * Color sources from Theme.colors:
 *   accent.action  → gurudeviBlue   (#3B82F6)
 *   accent.reward  → sanctuarySaffron (#E67E22)
 *   gradient nodes → deepIndigo / midnightBlue / twilightBlue area (deep navy)
 *   text.primary   → sacredWhite    (#F8FAFC)
 *   text.secondary → pearlGray      (#94A3B8)  / starlightGray
 *   text.inverse   → deepIndigo     (#0F172A)  / charcoalTruth
 *   text.muted     → mistGray       (#64748B)
 */
const CLASSIC_BASE_TOKENS = {
    gradientNodes: ['#F5EDD6', '#FAF7ED', '#E8E2CF'], // Vellum → Silk → Linen
    glass: {
        surface: { bg: 'rgba(250, 247, 237, 0.95)', opacity: 0.95, blurAmount: 28, border: 'rgba(42,35,24,0.05)' },
        modal: { bg: 'rgba(245, 237, 214, 0.98)', opacity: 0.98, blurAmount: 24, border: 'rgba(42,35,24,0.04)' },
        interact: { bg: 'rgba(232, 226, 207, 0.50)', opacity: 0.50, blurAmount: 8, border: 'rgba(42,35,24,0.08)' },
    },
    glow: {
        soft: { color: '#6B6480', radius: 10, opacity: 0.10 },
        primary: { color: '#3A7A9A', radius: 18, opacity: 0.25 },
        action: { color: '#3A7A9A', radius: 14, opacity: 0.35 },
        reward: { color: '#FDD925', radius: 20, opacity: 0.45 },
    },
    accent: { action: '#3A7A9A', reward: '#FDD925', danger: '#FF6347', muted: '#72695E' },
    text: { primary: '#2A2318', secondary: '#544A3D', inverse: '#1A1610', muted: '#72695E' },
} as const satisfies PhaseTokens;

export const CLASSIC_TOKENS = enrichThemeTokens(CLASSIC_BASE_TOKENS);

export function resolveClassicTokens(isDark: boolean): ResolvedThemeTokens {
    if (isDark) {
        return enrichThemeTokens(phaseMatrix.night.dark);
    }

    return CLASSIC_TOKENS;
}

/** The single resolver — this is what all components call via useTheme() */
export function resolvePhaseTokens(
    phase: TemporalPhase,
    isDark: boolean
): ResolvedThemeTokens {
    return enrichThemeTokens(phaseMatrix[phase][isDark ? 'dark' : 'light']);
}
