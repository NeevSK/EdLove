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

import { useEnvironment } from '@repo/ui/context/EnvironmentContext';
import type { TemporalPhase, ThemeMode } from '@repo/ui/context/types';
import {
  type ResolvedThemeTokens,
  resolveClassicTokens,
  resolvePhaseTokens,
} from '@repo/ui/theme/Theme';
import { getTextOnBackground, hexToRgbComponents } from '@repo/ui/utils/colorUtils';
import { useMemo } from 'react';

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

  const tokens = useMemo(
    () =>
      enableLivingTheme ? resolvePhaseTokens(temporalPhase, isDark) : resolveClassicTokens(isDark),
    [enableLivingTheme, temporalPhase, isDark],
  );

  const animationsEnabled = useMemo(
    () => enableLivingTheme && effectiveFidelity === 'high',
    [enableLivingTheme, effectiveFidelity],
  );
  const blurEnabled = useMemo(
    () => effectiveFidelity === 'high' && reality.deviceTier !== 'low',
    [effectiveFidelity, reality.deviceTier],
  );

  const textOnAccent = useMemo(
    () => getTextOnBackground(tokens.accent.action),
    [tokens.accent.action],
  );
  const textOnReward = useMemo(
    () => getTextOnBackground(tokens.accent.reward),
    [tokens.accent.reward],
  );

  const accentRgb = useMemo(() => hexToRgbComponents(tokens.accent.action), [tokens.accent.action]);
  const rewardRgb = useMemo(() => hexToRgbComponents(tokens.accent.reward), [tokens.accent.reward]);
  const surfaceRgb = useMemo(
    () => hexToRgbComponents(tokens.gradientNodes[0]),
    [tokens.gradientNodes],
  );

  return useMemo(
    () => ({
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
    }),
    [
      tokens,
      isDark,
      temporalPhase,
      animationsEnabled,
      blurEnabled,
      themeMode,
      setThemeMode,
      textOnAccent,
      textOnReward,
      accentRgb,
      rewardRgb,
      surfaceRgb,
    ],
  );
}
