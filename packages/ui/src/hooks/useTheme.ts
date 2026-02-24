/**
 * useTheme — Primary interface for phase-aware design tokens.
 *
 * Returns resolved tokens for the current temporal phase + theme mode.
 * This is the ONLY way components should access phase-specific colors.
 *
 * Usage:
 *   const { accent, glass, glow, text, gradientNodes, isDark } = useTheme();
 */
import { useEnvironment } from '../context/EnvironmentContext';
import { resolvePhaseTokens, PhaseTokens } from '../theme/Theme';
import type { TemporalPhase } from '../context/types';

export interface UseThemeReturn extends PhaseTokens {
    isDark: boolean;
    phase: TemporalPhase;
    /** Whether animations should run (based on device tier + fidelity) */
    animationsEnabled: boolean;
    /** Whether blur effects should be used */
    blurEnabled: boolean;
}

export function useTheme(): UseThemeReturn {
    const { temporalPhase, isDark, reality, effectiveFidelity } = useEnvironment();

    const tokens = resolvePhaseTokens(temporalPhase, isDark);

    const animationsEnabled = effectiveFidelity === 'high';
    const blurEnabled = effectiveFidelity === 'high' && reality.deviceTier !== 'low';

    return {
        ...tokens,
        isDark,
        phase: temporalPhase,
        animationsEnabled,
        blurEnabled,
    };
}
