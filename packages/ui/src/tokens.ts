/**
 * Gurudevi Design Tokens
 *
 * THE GOLDEN RULES:
 * 1. 2GB RAM CONSTRAINTS: Avoid heavy blurs (>12px) and extreme shadows.
 * 2. SRI LANKA CONTEXT: High contrast for outdoor usage, calm colors for classroom focus.
 * 3. NO BLACK/GREY: Use Ink (#2A2318) for text and Shadow Violet for elevation.
 */

export const tokens = {
  colors: {
    // Core brand roles
    primary: '#D4843A', // Saffron
    secondary: '#8BBF7A', // Dalu Green

    // Surface roles — vellum-based, never pure white
    background: '#F5EDD6', // Vellum (Paper-like, easy on eyes)
    surface: '#FAF7ED', // Silk
    surfaceSubtle: '#F0E8D0', // Linen / quiet recess
    surfaceElevated: '#FDF0DC', // Warm raised surface
    surfaceInteractive: 'rgba(232, 226, 207, 0.50)',

    // Content roles — warm ink, never pure black
    ink: '#2A2318', // Primary Text
    inkSubtle: '#5B5448', // Secondary Text
    textMuted: '#72695E',
    textInverse: '#F5EDD6',

    // Semantic status roles
    error: '#C64F3E',
    errorSurface: '#FBEBD8',
    success: '#5B8C4F',
    warning: '#D4A03A',
    info: '#4F7DA3',

    // Atmospheric roles
    accentLiving: '#8BBF7A',
    accentAtmospheric: '#7DD4C0',
    accentDepth: '#B8A9E0',
    border: '#E8E2CF',
    borderSubtle: 'rgba(42, 35, 24, 0.12)',
    borderStrong: '#544A3D',
    focus: '#7DD4C0',
    shadowColor: '#6B6480',
    shadowViolet: 'rgba(107, 100, 128, 0.15)',
    glass: 'rgba(245, 237, 214, 0.72)',
    loading: '#C4956A',
    emptyIllustration: '#C4956A',

    // Skeleton material — warm, low-noise, and readable against vellum
    skeletonBase: '#E8E2CF',
    skeletonHighlight: '#F5EDD6',

    // Shared transient layers. Keep these semantic so web/native primitives
    // resolve to the same visual language without sharing layout mechanics.
    overlay: 'rgba(42, 35, 24, 0.62)',
    overlayFallback: 'rgba(42, 35, 24, 0.78)',
    toastSurface: 'rgba(42, 35, 24, 0.94)',
    toastBorder: 'rgba(252, 249, 242, 0.18)',
    toastText: '#FCF9F2',
    toastTextMuted: '#D8D0C3',
    toastShadow: '0 10px 30px rgba(107, 100, 128, 0.28)',
    toastSuccess: '#8BBF7A',
    toastError: '#C64F3E',
    toastWarning: '#D4A03A',
    toastInfo: '#7DD4C0',
  },

  /** Semantic aliases are the preferred vocabulary for components. */
  semantic: {
    surface: {
      page: '#F5EDD6',
      canvas: '#FAF7ED',
      quiet: '#F0E8D0',
      elevated: '#FDF0DC',
      interactive: 'rgba(232, 226, 207, 0.50)',
    },
    text: {
      primary: '#2A2318',
      secondary: '#5B5448',
      muted: '#72695E',
      inverse: '#F5EDD6',
    },
    border: {
      subtle: 'rgba(42, 35, 24, 0.12)',
      base: '#E8E2CF',
      strong: '#544A3D',
      focus: '#7DD4C0',
      overlay: 'rgba(42, 35, 24, 0.62)',
      overlayFallback: 'rgba(42, 35, 24, 0.78)',
      toast: {
        surface: 'rgba(42, 35, 24, 0.94)',
        border: 'rgba(252, 249, 242, 0.18)',
        text: '#FCF9F2',
        textMuted: '#D8D0C3',
        success: '#8BBF7A',
        error: '#C64F3E',
        warning: '#D4A03A',
        info: '#7DD4C0',
      },
    },
    status: {
      error: '#C64F3E',
      errorSurface: '#FBEBD8',
      success: '#5B8C4F',
      warning: '#D4A03A',
      info: '#4F7DA3',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    full: 9999,
  },

  layout: {
    breakpoints: {
      phone: 0,
      tablet: 600,
      desktop: 1024,
    },
    pageFrame: {
      gutter: {
        phone: 20,
        tablet: 32,
        desktop: 40,
      },
      maxWidth: {
        phone: '100%',
        tablet: 720,
        desktop: 960,
      },
      readingMaxWidth: 720,
      stateMessageMaxWidth: 320,
    },
    grid: {
      phone: 1,
      tablet: 2,
      desktop: 3,
    },
  },

  interaction: {
    minTouchTarget: 44,
    focusRingWidth: 2,
  },

  typography: {
    // Sinhala/Tamil friendly font weight logic (prefer Regular/SemiBold over Thin/Black)
    fonts: {
      heading: 'Outfit_600SemiBold',
      body: 'Inter_400Regular',
      mono: 'JetBrainsMono_400Regular',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 32,
    },
    // Semantic roles keep repeated content hierarchy consistent across
    // native, compact, and web surfaces without changing caller copy.
    roles: {
      display: { fontSize: 32, lineHeight: 38, fontWeight: '600' },
      sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
      cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
      body: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
      meta: { fontSize: 12, lineHeight: 17, fontWeight: '400' },
      label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
    },
  },

  // Optimized for 2GB RAM devices
  performance: {
    maxBlurRadius: 12,
    shadowOpacityScale: 0.8,
  },
} as const;

export type Tokens = typeof tokens;
export default tokens;
