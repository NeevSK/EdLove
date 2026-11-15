import { View } from '@repo/ui/primitives';
import { resolveWorld } from '@repo/ui/theme';
import { useSystemAccess, WorldContext } from '@repo/ui/theme/native';
import { colors } from '@repo/ui/theme/Theme';
import { worldPhaseTokens, worldToPhaseTokens } from '@repo/ui/theme/worldBridge';
import { getTextOnBackground } from '@repo/ui/utils/colorUtils';
import { VariableContextProvider } from 'nativewind';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useComfort } from './ComfortPreferences';
import { useEnvironment } from './EnvironmentContext';

type CircadianContextType = {
  phase: string;
};

const CircadianContext = createContext<CircadianContextType | null>(null);

export const CircadianProvider = ({ children }: { children: React.ReactNode }) => {
  const { temporalPhase, isDark: darkByClock, worldId, enableLivingTheme, language } =
    useEnvironment();
  const phase = enableLivingTheme ? temporalPhase : darkByClock ? 'night' : 'morning';

  // The phone's contrast and transparency settings reach every world component.
  // The person's own comfort joins them: control size, a simpler look, contrast always raised.
  const system = useSystemAccess();
  const comfort = useComfort();
  const access = useMemo(
    () => ({
      ...system,
      contrast: comfort.contrast === 'more' ? ('more' as const) : system.contrast,
      size: comfort.size,
      simple: comfort.simple,
      sunlight: comfort.sunlight,
    }),
    [system, comfort.contrast, comfort.size, comfort.simple, comfort.sunlight],
  );
  const world = useMemo(
    // Sunlight wears the light palette at a neutral hour (resolveWorld does the same).
    () => resolveWorld(worldId, phase, darkByClock ? 'dark' : 'light', access),
    [worldId, phase, darkByClock, access],
  );

  const circadianVars = useMemo(() => {
    // Sanctuary keeps its hand-tuned matrix on the clock, as before. Other worlds
    // follow the same phase as the world components, so both agree on screen.
    // In sunlight the older screens take the world's sunlit tokens too, light, so every screen
    // reads outdoors, not only the ones already on the world kit.
    const sun = comfort.sunlight;
    const isDark = darkByClock && !sun;
    const tokens = sun
      ? worldToPhaseTokens(world.tokens)
      : worldPhaseTokens(worldId, worldId === 'sanctuary' ? temporalPhase : phase, isDark);
    const w = world.tokens;

    // Semantic mappings
    return {
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
    };
  }, [worldId, temporalPhase, phase, darkByClock, world, comfort.sunlight]);

  const contextValue = useMemo(() => ({ phase: temporalPhase }), [temporalPhase]);
  const worldValue = useMemo(() => ({ world, language }), [world, language]);

  return (
    <CircadianContext value={contextValue}>
      <WorldContext value={worldValue}>
        <VariableContextProvider value={circadianVars}>
          <View style={{ flex: 1 }}>{children}</View>
        </VariableContextProvider>
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
