/**
 * World context for React Native.
 *
 * `CircadianProvider` fills this from the person's choice (world, hour, mode,
 * language). `WorldScope` overrides it for a subtree, for example the small
 * previews in the world picker. Components fall back to Sanctuary in the
 * morning, so they also render in tests and isolated stories.
 */

import { createContext, type ReactNode, useContext, useMemo, useSyncExternalStore } from 'react';
import { resolveWorld } from '../resolve';
import type {
  Phase,
  ResolvedWorld,
  WorldAccess,
  WorldId,
  WorldLanguage,
  WorldMode,
} from '../types';
import { getWorldFontEpoch, subscribeWorldFonts } from './style';

export interface WorldContextValue {
  world: ResolvedWorld;
  language: WorldLanguage;
}

const FALLBACK: WorldContextValue = {
  world: resolveWorld('sanctuary', 'morning', 'light'),
  language: 'en',
};

export const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorldContext(): WorldContextValue {
  // Re-render once when fonts finish loading, so text leaves the fallback face.
  useSyncExternalStore(subscribeWorldFonts, getWorldFontEpoch, getWorldFontEpoch);
  return useContext(WorldContext) ?? FALLBACK;
}

/** The resolved world for this part of the tree. */
export function useWorld(): ResolvedWorld {
  return useWorldContext().world;
}

export interface WorldScopeProps {
  world: WorldId;
  phase?: Phase;
  mode?: WorldMode;
  /** Preview another comfort (size, simpler look, contrast) over the person's own. */
  access?: Partial<WorldAccess>;
  children: ReactNode;
}

/** Render a subtree in another world (previews, onboarding choices). */
export function WorldScope({ world, phase, mode, access, children }: WorldScopeProps) {
  const parent = useWorldContext();
  const value = useMemo(
    () => ({
      world: resolveWorld(
        world,
        phase ?? parent.world.phase,
        mode ?? parent.world.mode,
        access ? { ...parent.world.access, ...access } : parent.world.access,
      ),
      language: parent.language,
    }),
    [world, phase, mode, parent, access],
  );
  return <WorldContext value={value}>{children}</WorldContext>;
}
