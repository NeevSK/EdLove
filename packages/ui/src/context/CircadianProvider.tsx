import { View } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme/Theme';
import { worldPhaseTokens } from '@repo/ui/theme/worldBridge';
import { getTextOnBackground } from '@repo/ui/utils/colorUtils';
import { WorldContext } from '@repo/ui/world/native/WorldContext';
import { resolveWorld } from '@repo/ui/world/resolve';
import { vars } from 'nativewind';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useEnvironment } from './EnvironmentContext';

type CircadianContextType = {
  phase: string;
};

const CircadianContext = createContext<CircadianContextType | null>(null);

export const CircadianProvider = ({ children }: { children: React.ReactNode }) => {
  const { temporalPhase, isDark, worldId, enableLivingTheme, language } = useEnvironment();
  const phase = enableLivingTheme ? temporalPhase : isDark ? 'night' : 'morning';

  const world = useMemo(
    () => resolveWorld(worldId, phase, isDark ? 'dark' : 'light'),
    [worldId, phase, isDark],
  );

  const circadianVars = useMemo(() => {
    // Sanctuary keeps its hand-tuned matrix on the clock, as before. Other worlds
    // follow the same phase as the world components, so both agree on screen.
    const tokens = worldPhaseTokens(worldId, worldId === 'sanctuary' ? temporalPhase : phase, isDark);
    const w = world.tokens;

    // Semantic mappings
    return vars({
      '--phase-world': tokens.gradientNodes[0],
      '--phase-canvas': tokens.gradientNodes[1],
      '--phase-surface': tokens.glass.surface.bg,
      '--phase-elevated': tokens.glass.modal.bg,
      '--phase-modal-card': isDark ? '#302920' : '#FDFAF3',
      '--phase-scrim': isDark ? 'rgba(17, 20, 27, 0.88)' : 'rgba(26, 22, 16, 0.82)',
      '--phase-modal-border': isDark ? 'rgba(232, 235, 255, 0.12)' : 'rgba(42, 35, 24, 0.12)',
      '--phase-interactive': tokens.glass.interact.bg,
      '--phase-accent': tokens.accent.action,
      '--phase-reward': tokens.accent.reward,
      '--phase-danger': tokens.accent.danger,

      '--phase-text-primary': tokens.text.primary,
      '--phase-text-secondary': tokens.text.secondary,
      '--phase-text-inverse': tokens.text.inverse,
      '--phase-text-on-accent': getTextOnBackground(
        tokens.accent.action,
        colors.inkTruth,
        colors.sacredWhite,
      ),
      '--phase-text-on-surface': getTextOnBackground(
        tokens.glass.surface.bg,
        colors.inkTruth,
        colors.sacredWhite,
      ),

      // World semantic tokens, for className styling: bg-w-ground, text-w-ink ...
      '--w-ground': w.ground,
      '--w-raised': w.raised,
      '--w-sunken': w.sunken,
      '--w-ink': w.ink,
      '--w-ink-soft': w.inkSoft,
      '--w-ink-faint': w.inkFaint,
      '--w-line': w.line,
      '--w-lamp': w.lamp,
      '--w-on-lamp': w.onLamp,
      '--w-lamp-deep': w.lampDeep,
      '--w-glow': w.glow,
      '--w-ornament': w.ornament,
      '--w-danger': w.danger,
      '--w-on-danger': w.onDanger,
      '--w-success': w.success,
      '--w-focus': w.focus,
    });
  }, [worldId, temporalPhase, phase, isDark, world]);

  const contextValue = useMemo(() => ({ phase: temporalPhase }), [temporalPhase]);
  const worldValue = useMemo(() => ({ world, language }), [world, language]);

  return (
    <CircadianContext value={contextValue}>
      <WorldContext value={worldValue}>
        <View style={[circadianVars, { flex: 1 }]}>{children}</View>
      </WorldContext>
    </CircadianContext>
  );
};

export const useCircadian = () => {
  const context = useContext(CircadianContext);
  if (!context) {
    throw new Error('useCircadian must be used within a CircadianProvider');
  }
  return context;
};
