/**
 * EDLOVE DESIGN SYSTEM
 * 
 * Foundation design tokens based on EdLove's cinematic aesthetic
 * Reference: Docs/02_DESIGN.md
 * 
 * Philosophy: Professional yet soulful. Structured yet breathing.
 * Like a Terrence Malick film - precise AND emotional.
 */

// ============================================================================
// COLORS - The Cinematic Palette
// ============================================================================

export const colors = {
    // PRIMARY - The Core
    deepIndigo: '#2D3561',      // Wisdom, depth. Primary text on light.
    warmGold: '#D4A574',         // Love, light. Accents, CTAs, active states.
    softWhite: '#F5F1E8',        // Space, breath. Primary background.

    // SECONDARY - The Environment
    forestGreen: '#4A6357',      // Grounding. Nature themes. Success states.
    dawnRose: '#E8B4B8',         // Tenderness. Community. Stories.
    skyBlue: '#A8C5D6',          // Possibility. Future. Links.

    // ACCENTS - The Sparks (use sparingly!)
    cosmicPurple: '#9B7EBD',     // Paradigm Cosmos. Philosophical content.
    emberOrange: '#E07A5F',      // Gurudevi. Action elements. Urgent CTAs.
    starlightSilver: '#E8F4F8',  // Subtle backgrounds. Cards. Hover states.

    // DARK MODE (future)
    deepNight: '#1A1C2E',        // Dark mode background
    softCream: '#E8E4DB',        // Dark mode text

    // FUNCTIONAL
    white: '#FFFFFF',            // Avoid if possible (harsh)
    black: '#000000',            // Avoid if possible (harsh)
    transparent: 'transparent',

    // OVERLAYS & SHADOWS (RGBA for opacity)
    shadowDark: 'rgba(45, 53, 97, 0.08)',        // Subtle shadows
    shadowMedium: 'rgba(45, 53, 97, 0.10)',      // Card hover
    shadowStrong: 'rgba(45, 53, 97, 0.12)',      // Modals
    glowGold: 'rgba(212, 165, 116, 0.25)',       // Gold glow effect
    overlayLight: 'rgba(245, 241, 232, 0.95)',   // Light overlay
    overlayDark: 'rgba(29, 28, 46, 0.8)',        // Dark overlay
};

// ============================================================================
// TYPOGRAPHY - Literary & Modern
// ============================================================================

export const typography = {
    // Font Families (Remember to load these!)
    fontFamily: {
        display: '"Cinzel", serif',                // Hero moments, ceremonial
        heading: '"Libre Baskerville", serif',     // All headings H1-H3
        body: '"Inter", sans-serif',               // All body text
        caption: '"Inter", sans-serif',            // Dates, labels, meta
        code: '"JetBrains Mono", monospace',       // Code blocks
    },

    // Font Sizes (Responsive - these are desktop base)
    fontSize: {
        display: 64,    // Hero text (48px tablet, 36px mobile)
        h1: 48,         // Main headings (36px tablet, 28px mobile)
        h2: 36,         // Section headings (28px tablet, 24px mobile)
        h3: 24,         // Sub-headings (20px tablet, 18px mobile)
        bodyLarge: 18,  // Featured body text (17px tablet, 16px mobile)
        body: 16,       // Standard body text (16px tablet, 15px mobile)
        caption: 13,    // Meta text, labels (13px tablet, 12px mobile)
    },

    // Font Weights
    fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Line Heights (Generous - this is a reading experience)
    lineHeight: {
        display: 1.1,   // Display/H1
        heading: 1.3,   // H2/H3
        body: 1.7,      // Body text - generous for reading
        caption: 1.4,   // Captions
    },

    // Letter Spacing
    letterSpacing: {
        tight: '-0.02em',   // Display (elegant)
        heading: '-0.01em', // Headings
        normal: '0',        // Body (natural)
        wide: '0.04em',     // Captions (slightly open)
    },
};

// ============================================================================
// SPACING - 8px Base Grid
// ============================================================================

export const spacing = {
    xs: 4,       // Tight internal spacing (icon + label)
    sm: 8,       // Small gaps (between related items)
    md: 16,      // Default spacing (between elements)
    lg: 32,      // Section breathing room
    xl: 64,      // Between major sections
    '2xl': 128,  // Hero sections, page breathers
    '3xl': 192,  // Full-page breathing moments
};

// ============================================================================
// BORDER RADIUS - Organic, Never Sharp
// ============================================================================

export const corners = {
    sm: 4,       // Subtle - buttons, inputs
    md: 8,       // Cards, containers
    lg: 16,      // Feature cards, modals
    full: 9999,  // Pills, avatars, circular
};

// ============================================================================
// SHADOWS - Soft, Layered
// ============================================================================

export const shadows = {
    none: {
        boxShadow: 'none',
    },

    sm: {
        // Subtle lift. Cards at rest.
        boxShadow: '0 1px 3px rgba(45, 53, 97, 0.08)',
    },

    md: {
        // Cards on hover. Dropdowns.
        boxShadow: '0 4px 12px rgba(45, 53, 97, 0.10)',
    },

    lg: {
        // Modals. Feature elements.
        boxShadow: '0 8px 32px rgba(45, 53, 97, 0.12)',
    },

    glow: {
        // Gold glow. Special moments. Active states.
        boxShadow: '0 0 24px rgba(212, 165, 116, 0.25)',
    },
};

// ============================================================================
// MOTION - Contemplative Pacing
// ============================================================================

export const motion = {
    // Duration (milliseconds)
    fast: 200,            // Quick interactions (hover, focus)
    default: 300,         // Standard transitions (most common)
    slow: 500,            // Meditative pace
    contemplative: 800,   // The "Malick Effect" - unhurried

    // Easing Functions (CSS cubic-bezier)
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',    // Standard ease-in-out
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',       // Accelerating
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',      // Decelerating (good for exit)
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth both ends
        linear: 'linear',                            // Avoid - feels robotic
    },
};

// ============================================================================
// BORDERS
// ============================================================================

export const borders = {
    width: {
        none: 0,
        thin: 1,
        medium: 1.5,
        thick: 2,
    },

    style: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
    },

    // Common border combinations
    subtle: `1px solid rgba(45, 53, 97, 0.08)`,   // Very faint border
    default: `1px solid rgba(45, 53, 97, 0.15)`,  // Standard border
    focus: `1.5px solid ${colors.warmGold}`,       // Focus state border
};

// ============================================================================
// OPACITY LEVELS
// ============================================================================

export const opacity = {
    transparent: 0,
    subtle: 0.08,
    light: 0.15,
    medium: 0.4,
    strong: 0.6,
    heavy: 0.8,
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
    modal: 400,        // Modals, dialogs
    toast: 500,        // Toasts, notifications
    tooltip: 600,      // Tooltips
};

// ============================================================================
// BREAKPOINTS - Responsive Design
// ============================================================================

export const breakpoints = {
    mobile: 375,       // iPhone SE width (minimum)
    tablet: 768,       // iPad portrait
    desktop: 1200,     // Standard desktop
    wide: 1440,        // Wide desktop

    // Media query helpers (for CSS)
    mediaQueries: {
        mobile: '@media (max-width: 767px)',
        tablet: '@media (min-width: 768px) and (max-width: 1199px)',
        desktop: '@media (min-width: 1200px)',
        wide: '@media (min-width: 1440px)',
    },
};

// ============================================================================
// COMPONENT PRESETS - Common Patterns
// ============================================================================

export const components = {
    // Button Styles
    button: {
        primary: {
            backgroundColor: colors.warmGold,
            color: colors.deepIndigo,
            borderRadius: corners.sm,
            padding: '12px 28px',
            fontFamily: typography.fontFamily.body,
            fontWeight: typography.fontWeight.medium,
            fontSize: typography.fontSize.caption + 2, // 15px
        },

        secondary: {
            backgroundColor: 'transparent',
            color: colors.deepIndigo,
            border: `${borders.width.medium}px solid rgba(45, 53, 97, 0.4)`,
            borderRadius: corners.sm,
            padding: '12px 28px',
            fontFamily: typography.fontFamily.body,
            fontWeight: typography.fontWeight.medium,
            fontSize: typography.fontSize.caption + 2,
        },

        ghost: {
            backgroundColor: 'transparent',
            color: colors.deepIndigo,
            border: 'none',
            fontFamily: typography.fontFamily.body,
            fontWeight: typography.fontWeight.regular,
        },
    },

    // Card Styles
    card: {
        default: {
            backgroundColor: colors.softWhite,
            border: borders.subtle,
            borderRadius: corners.md,
            padding: spacing.lg,
            boxShadow: shadows.sm.boxShadow,
        },

        elevated: {
            backgroundColor: colors.softWhite,
            border: borders.subtle,
            borderRadius: corners.md,
            padding: spacing.lg,
            boxShadow: shadows.md.boxShadow,
        },
    },

    // Input Styles
    input: {
        default: {
            backgroundColor: colors.softWhite,
            border: `1px solid rgba(45, 53, 97, 0.15)`,
            borderRadius: corners.sm,
            padding: '12px 16px',
            fontFamily: typography.fontFamily.body,
            fontSize: typography.fontSize.body,
        },

        focus: {
            border: borders.focus,
            boxShadow: shadows.glow.boxShadow,
            outline: 'none',
        },
    },
};

// ============================================================================
// ACCESSIBILITY - WCAG AA Compliance
// ============================================================================

export const accessibility = {
    // Minimum contrast ratios (WCAG AA)
    contrast: {
        normalText: 4.5,    // 4.5:1 minimum for normal text
        largeText: 3.0,     // 3:1 minimum for large text (18px+)
    },

    // Focus states (keyboard navigation)
    focus: {
        outline: `2px solid ${colors.warmGold}`,
        outlineOffset: '2px',
    },

    // Screen reader only (visually hidden)
    srOnly: {
        position: 'absolute' as const,
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap' as const,
        borderWidth: '0',
    },
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
    breakpoints,
    components,
    accessibility,
};

export default Theme;
