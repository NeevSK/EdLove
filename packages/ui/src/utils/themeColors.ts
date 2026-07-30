/**
 * Compatibility adapter for older components that still consume the flatter
 * `ThemeColors` shape. New code should prefer `useTheme()` directly.
 *
 * The key rule: there is only one resolver for living theme tokens.
 * This file maps those canonical tokens into the legacy shape instead of
 * maintaining a second parallel theme system.
 */

import type { TemporalPhase } from '@repo/ui/context/types';
import {
  type ResolvedThemeTokens,
  resolveClassicTokens,
  resolvePhaseTokens,
  Theme,
} from '@repo/ui/theme/Theme';

export interface ThemeColors {
  // Backgrounds
  primary: string;
  secondary: string;
  tertiary: string;

  // Text
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Actions
  action: string;
  success: string;
  error: string;
  warning: string;

  // Functional
  border: string;
  overlay: string;
  shadow: string;
  glow: string;
  backgroundDark: string;
  obsidian: string;
  black: string;
  gurudeviBlue: string;
  card: string;
  surface: string;
}

type ThemeColorSource = Pick<ResolvedThemeTokens, 'scene' | 'text' | 'accent' | 'glow'> & {
  isDark: boolean;
};

/**
 * Convert the canonical living-theme token set into the flatter `ThemeColors`
 * shape used by older components. This keeps legacy consumers working while
 * allowing the app to rely on one resolver.
 */
export function toThemeColors(source: ThemeColorSource): ThemeColors {
  return {
    primary: source.scene.canvas.bg,
    secondary: source.scene.surface.bg,
    tertiary: source.scene.elevated.bg,

    text: source.text.onCanvas,
    textPrimary: source.text.onCanvas,
    textSecondary: source.text.secondary,
    textTertiary: source.text.muted,

    action: source.accent.action,
    success: Theme.colors.success,
    error: Theme.colors.error,
    warning: Theme.colors.warning,

    border: source.scene.surface.border,
    overlay: source.scene.interactive.bg,
    shadow: source.isDark ? Theme.colors.shadowDeep : Theme.colors.shadowAmbient,
    glow: source.glow.primary.color,
    backgroundDark: source.scene.chrome.bg,
    obsidian: source.scene.world.bg,
    black: source.scene.world.bg,
    gurudeviBlue: Theme.colors.gurudeviBlue,
    card: source.scene.surface.bg,
    surface: source.scene.surface.bg,
  };
}

/**
 * Legacy helper retained for compatibility. It now delegates to the canonical
 * phase resolver instead of maintaining a separate modulation path.
 */
export function getThemeColors(isDark: boolean, temporalPhase?: TemporalPhase): ThemeColors {
  const tokens = temporalPhase
    ? resolvePhaseTokens(temporalPhase, isDark)
    : resolveClassicTokens(isDark);

  return toThemeColors({
    ...tokens,
    isDark,
  });
}

// Deprecated name retained for call sites that expect an object export.
export const themeColors = {
  primary: Theme.colors.sanctuarySaffron,
  secondary: Theme.colors.sageGreen,
  tertiary: Theme.colors.shroud,
  gurudeviBlue: Theme.colors.gurudeviBlue,
  card: Theme.colors.silk,
};
