/**
 * Environment Context (Orchestrator)
 * 2026 Sovereign Architecture: Decoupled Atomic State Providers.
 */

import { identity, useStore } from '@repo/core/logic';
import { type ReactNode, useCallback, useMemo } from 'react';
import { FidelityProvider, useFidelity } from '@repo/ui/context/FidelityProvider';
import { LanguageProvider, useLanguage } from '@repo/ui/context/LanguageProvider';
// Atomic Providers
import { RealityProvider, useReality } from '@repo/ui/context/RealityProvider';
import { ThemeProvider, useThemeContext } from '@repo/ui/context/ThemeProvider';
import type { EnvironmentContextValue } from '@repo/ui/context/types';

/**
 * Environment Provider Component
 * The Orchestrator: Wraps the app in atomic domain-specific providers.
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <RealityProvider>
        <ThemeProvider>
          <FidelityProvider>{children}</FidelityProvider>
        </ThemeProvider>
      </RealityProvider>
    </LanguageProvider>
  );
}

/**
 * useEnvironment (Legacy Orchestrator Hook)
 * Aggregates atomic contexts for backward compatibility.
 * ⚠️ DEPRECATION NOTICE: Favor useReality, useTheme, useLanguage, or useFidelity for better performance.
 */
export function useEnvironment(): EnvironmentContextValue {
  const user = useStore((state: any) => state.user);
  const activeBond = (user as any)?.activeBond ?? null;

  const { reality, refreshReality } = useReality();
  const { language, setLanguage } = useLanguage();
  const {
    themeMode,
    temporalPhase,
    isDark,
    isVeilActive,
    enableLivingTheme,
    setThemeMode,
    toggleVeil,
    setEnableLivingTheme,
  } = useThemeContext();
  const { fidelityLevel, effectiveFidelity, setFidelityLevel } = useFidelity();

  // ReBAC actions
  const switchPerspective = useCallback(async (entityId: string, capacity: string) => {
    await identity.switchPerspective(entityId, capacity as any);
  }, []);

  // Aggregate into a single memoized value to minimize blast radius for legacy consumers
  return useMemo(
    () => ({
      // State
      activeBond,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,

      // Actions
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
      switchPerspective,
    }),
    [
      activeBond,
      themeMode,
      temporalPhase,
      isDark,
      fidelityLevel,
      effectiveFidelity,
      language,
      reality,
      isVeilActive,
      enableLivingTheme,
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      refreshReality,
      setEnableLivingTheme,
      switchPerspective,
    ],
  );
}

export {
  FidelityProvider,
  useFidelity,
} from '@repo/ui/context/FidelityProvider';
export {
  LanguageProvider,
  useLanguage,
} from '@repo/ui/context/LanguageProvider';
// Re-export utility functions and atomic hooks
export {
  RealityProvider,
  useReality,
} from '@repo/ui/context/RealityProvider';
export {
  ThemeProvider,
  useThemeContext,
} from '@repo/ui/context/ThemeProvider';

export { getTemporalPhase, shouldUseDarkTheme } from '@repo/ui/context/utils';
