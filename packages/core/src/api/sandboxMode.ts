import { useExperienceState } from '@repo/core/lib/experienceState';

/**
 * The four mutually-exclusive runtime modes for the sandbox/demo layer.
 *
 * - `live`      — normal production path, no data interception
 * - `ghost`     — isExplorerMode: real DB is queried first; samples injected when result is empty
 * - `demo`      — isDemoMode: all reads return mock data, all writes are no-ops
 * - `bridging`  — isBridging: a real write is in-flight to graduate sample data to production
 */
export type SandboxModeValue = 'live' | 'ghost' | 'demo' | 'bridging';

/**
 * Synchronous mode resolver for use inside the API/proxy layer (no React hooks).
 * Reads directly from Zustand store state — safe to call outside component tree.
 */
export function resolveSandboxMode(): SandboxModeValue {
  const { isDemoMode, isExplorerMode, isBridging } = useExperienceState.getState();
  if (isBridging) return 'bridging';
  if (isDemoMode) return 'demo';
  if (isExplorerMode) return 'ghost';
  return 'live';
}

/**
 * React hook for components that need to react to mode changes.
 *
 * Usage:
 *   const mode = useSandboxMode();
 *   if (mode !== 'live') showSandboxBadge();
 *
 * Replaces:
 *   const isDemoMode = useExperienceState(s => s.isDemoMode);
 *   const isExplorerMode = useExperienceState(s => s.isExplorerMode);
 *   const isBridging = useExperienceState(s => s.isBridging);
 */
export function useSandboxMode(): SandboxModeValue {
  return useExperienceState((state) => {
    if (state.isBridging) return 'bridging';
    if (state.isDemoMode) return 'demo';
    if (state.isExplorerMode) return 'ghost';
    return 'live';
  });
}

/**
 * Narrow helpers — use these in component guards to avoid string comparisons.
 */
export const isSandboxActive = (): boolean => resolveSandboxMode() !== 'live';
export const isDemoActive = (): boolean => resolveSandboxMode() === 'demo';
export const isGhostActive = (): boolean => resolveSandboxMode() === 'ghost';
export const isBridgingActive = (): boolean => resolveSandboxMode() === 'bridging';
