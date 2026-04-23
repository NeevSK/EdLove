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
    // Core Brand
    primary: '#D4843A', // Saffron
    secondary: '#8BBF7A', // Dalu Green
    
    // Surfaces
    background: '#F5EDD6', // Vellum (Paper-like, easy on eyes)
    surface: '#FFFFFF',
    surfaceSubtle: '#FAF6E9',
    
    // Content
    ink: '#2A2318', // Primary Text
    inkSubtle: '#5B5448', // Secondary Text
    
    // Semantic
    error: '#C64F3E',
    success: '#5B8C4F',
    warning: '#D4A03A',
    info: '#4F7DA3',
    
    // Decorative / Special
    shadowViolet: 'rgba(107, 100, 128, 0.15)',
    glass: 'rgba(255, 255, 255, 0.4)',
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
  },

  // Optimized for 2GB RAM devices
  performance: {
    maxBlurRadius: 12,
    shadowOpacityScale: 0.8,
  }
} as const;

export type Tokens = typeof tokens;
export default tokens;
