/**
 * useTheme  Primary interface for phase-aware design tokens.
 *
 * Returns resolved tokens for the current temporal phase + theme mode.
 * This is the ONLY way components should access phase-specific colors.
 *
 * Usage:
 *   const { accent, glass, glow, text, gradientNodes, isDark } = useTheme();
 *   const { textOnAccent, textOnReward, accentRgb } = useTheme(); // adaptive text
 */
import { useEnvironment } from '../context/EnvironmentContext';
import type { TemporalPhase, ThemeMode } from '../context/types';
import { type ResolvedThemeTokens, resolveClassicTokens, resolvePhaseTokens } from '../theme/Theme';
import { getTextOnBackground, hexToRgbComponents } from '../utils/colorUtils';

/** Adaptive color tokens computed from the current accent/reward. */
export interface AdaptiveTokens {
  /**
   * WCAG-safe text color to place ON TOP of `accent.action` backgrounds.
   * Automatically switches between Ink (#2A2318) and Sacred White (#FCF9F2)
   * based on the accent's luminance  e.g. Temple Gold needs dark ink text.
   */
  textOnAccent: string;
  /**
   * WCAG-safe text color to place ON TOP of `accent.reward` backgrounds.
   */
  textOnReward: string;
  /**
   * RGB components of `accent.action` as `"r,g,b"`  used in CSS
   * `rgba(var(--action-rgb), 0.15)` patterns without needing a full CSS
   * variable per opacity level.
   */
  accentRgb: string;
  /**
   * RGB components of `accent.reward` as `"r,g,b"`.
   */
  rewardRgb: string;
  /**
   * RGB components of the primary surface gradient node as `"r,g,b"`.
   * Useful for ambient glow layers that follow the phase background.
   */
  surfaceRgb: string;
}

export interface UseThemeReturn extends ResolvedThemeTokens, AdaptiveTokens {
  templeGold: string;
  sageGreen: string;
  isDark: boolean;
  phase: TemporalPhase;
  /** Whether animations should run (based on device tier + fidelity) */
  animationsEnabled: boolean;
  /** Whether blur effects should be used */
  blurEnabled: boolean;
  /** Current theme mode (system, light, dark, auto) */
  themeMode: ThemeMode;
  /** Action to update theme mode */
  setThemeMode: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeReturn {
  const {
    temporalPhase,
    isDark,
    reality,
    effectiveFidelity,
    enableLivingTheme,
    themeMode,
    setThemeMode,
  } = useEnvironment();

  const tokens = enableLivingTheme
    ? resolvePhaseTokens(temporalPhase, isDark)
    : resolveClassicTokens(isDark);

  const animationsEnabled = enableLivingTheme && effectiveFidelity === 'high';
  const blurEnabled = effectiveFidelity === 'high' && reality.deviceTier !== 'low';

  // --- Adaptive text colors (WCAG-computed) ---
  const textOnAccent = getTextOnBackground(tokens.accent.action);
  const textOnReward = getTextOnBackground(tokens.accent.reward);

  // --- RGB component strings for flexible CSS rgba() usage ---
  const accentRgb = hexToRgbComponents(tokens.accent.action);
  const rewardRgb = hexToRgbComponents(tokens.accent.reward);
  const surfaceRgb = hexToRgbComponents(tokens.gradientNodes[0]);

  return {
    ...tokens,
    templeGold: tokens.accent.templeGold,
    sageGreen: tokens.accent.sageGreen,
    isDark,
    phase: temporalPhase,
    animationsEnabled,
    blurEnabled,
    themeMode,
    setThemeMode,
    // Adaptive tokens
    textOnAccent,
    textOnReward,
    accentRgb,
    rewardRgb,
    surfaceRgb,
  };
}
