/**
 * Environment Context (Orchestrator)
 * 2026 Sovereign Architecture: Decoupled Atomic State Providers.
 */

import { identity, useAuthStore } from '@repo/core/logic';
import { type ReactNode, useCallback, useMemo } from 'react';
import { FidelityProvider, useFidelity, useFidelityOptional } from './FidelityProvider';
import { LanguageProvider, useLanguage, useLanguageOptional } from './LanguageProvider';
import { SensoryProvider } from './SensoryProvider';
import { ThemeProvider, useThemeContext, useThemeContextOptional } from './ThemeProvider';
import type { EnvironmentContextValue } from './types';
import { useVisualCapabilities } from './VisualCapabilities';

/**
 * Environment Provider Component
 * The Orchestrator: Wraps the app in atomic domain-specific providers.
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SensoryProvider>
        <ThemeProvider>
          <FidelityProvider>{children}</FidelityProvider>
        </ThemeProvider>
      </SensoryProvider>
    </LanguageProvider>
  );
}

/**
 * useEnvironment (Legacy Orchestrator Hook)
 * Aggregates atomic contexts for backward compatibility.
 * ⚠️ DEPRECATION NOTICE: Favor useTheme, useLanguage, useFidelity or useVisualCapabilities for better performance.
 */
export function useEnvironment(): EnvironmentContextValue {
  const user = useAuthStore((state: any) => state.user);
  const activeBond = (user as any)?.activeBond ?? null;

  const { language, setLanguage } = useLanguageOptional();
  const {
    themeMode,
    temporalPhase,
    isDark,
    isVeilActive,
    enableLivingTheme,
    worldId,
    setThemeMode,
    toggleVeil,
    setEnableLivingTheme,
    setWorld,
  } = useThemeContextOptional();
  const { fidelityLevel, setFidelityLevel } = useFidelityOptional();
  const visualCapabilities = useVisualCapabilities();
  const effectiveFidelity = visualCapabilities.effectiveFidelity;

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
      isVeilActive,
      enableLivingTheme,
      worldId,
      visualCapabilities,

      // Actions
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      setEnableLivingTheme,
      setWorld,
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
      isVeilActive,
      enableLivingTheme,
      worldId,
      visualCapabilities,
      setThemeMode,
      setFidelityLevel,
      setLanguage,
      toggleVeil,
      setEnableLivingTheme,
      setWorld,
      switchPerspective,
    ],
  );
}

export {
  FidelityProvider,
  useFidelity,
  useFidelityOptional,
} from './FidelityProvider';
export {
  LanguageProvider,
  useLanguage,
  useLanguageOptional,
} from './LanguageProvider';
export {
  ThemeProvider,
  useThemeContext,
  useThemeContextOptional,
} from './ThemeProvider';

export { getTemporalPhase, shouldUseDarkTheme } from './utils';
