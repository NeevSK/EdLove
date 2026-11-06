'use client';

import { DEFAULT_WORLD, isWorldId, type WorldId } from '@repo/ui/theme';
import { useSyncExternalStore } from 'react';

export type LuminanceMode = 'light' | 'dark' | 'system';
export type ResolvedLuminance = 'light' | 'dark';

export interface WorldThemeSnapshot {
  readonly world: WorldId;
  readonly mode: LuminanceMode;
  readonly resolvedMode: ResolvedLuminance;
}

const WORLD_KEY = 'gurudevi_world';
const MODE_KEY = 'gurudevi_mode';
const OBSOLETE_THEME_KEY = 'gurudevi_theme';
const OBSOLETE_PRESET_KEY = 'gurudevi_appearance_preset';

export const WORLD_THEME_BUS = 'gurudevi_world_theme_bus';
export const WORLD_CHANGED_EVENT = 'gurudevi:world-changed';
export const MODE_CHANGED_EVENT = 'gurudevi:mode-changed';

const VALID_MODES: readonly LuminanceMode[] = ['light', 'dark', 'system'];

const SERVER_SNAPSHOT: WorldThemeSnapshot = {
  world: DEFAULT_WORLD,
  mode: 'system',
  resolvedMode: 'light',
};

function isServer(): boolean {
  return typeof window === 'undefined';
}

function resolveSystemIsDark(): boolean {
  if (isServer() || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveMode(mode: LuminanceMode): ResolvedLuminance {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return resolveSystemIsDark() ? 'dark' : 'light';
}

function readStoredWorld(): WorldId {
  if (isServer()) return DEFAULT_WORLD;
  try {
    const saved = localStorage.getItem(WORLD_KEY);
    return isWorldId(saved) ? saved : DEFAULT_WORLD;
  } catch {
    return DEFAULT_WORLD;
  }
}

function readStoredMode(): LuminanceMode {
  if (isServer()) return 'system';
  try {
    const savedMode = localStorage.getItem(MODE_KEY) as LuminanceMode | null;
    if (savedMode && VALID_MODES.includes(savedMode)) {
      return savedMode;
    }
    // Purge obsolete keys
    localStorage.removeItem(OBSOLETE_THEME_KEY);
    localStorage.removeItem(OBSOLETE_PRESET_KEY);
    return 'system';
  } catch {
    return 'system';
  }
}

function applyDomAttributes(world: WorldId, resolvedMode: ResolvedLuminance): void {
  if (isServer() || typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-world', world);
  root.setAttribute('data-mode', resolvedMode);
  // Strictly clean up legacy shims
  root.removeAttribute('data-theme');
  root.removeAttribute('data-appearance');
}

class WorldThemeStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: WorldThemeSnapshot = SERVER_SNAPSHOT;
  private channel: BroadcastChannel | null = null;
  private initialized = false;

  private createSnapshot(world: WorldId, mode: LuminanceMode): WorldThemeSnapshot {
    const resolvedMode = resolveMode(mode);
    return { world, mode, resolvedMode };
  }

  private initClient(): void {
    if (this.initialized || isServer()) return;
    this.initialized = true;

    // Purge legacy storage shims on first load
    try {
      localStorage.removeItem(OBSOLETE_THEME_KEY);
      localStorage.removeItem(OBSOLETE_PRESET_KEY);
    } catch {}

    const world = readStoredWorld();
    const mode = readStoredMode();
    this.currentSnapshot = this.createSnapshot(world, mode);
    applyDomAttributes(this.currentSnapshot.world, this.currentSnapshot.resolvedMode);

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(WORLD_THEME_BUS);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'WORLD_THEME_SYNC') {
            this.rehydrateFromStorage();
          }
        };
      } catch {
        this.channel = null;
      }
    }

    window.addEventListener('storage', (event) => {
      if (event.key === WORLD_KEY || event.key === MODE_KEY) {
        this.rehydrateFromStorage();
      }
    });

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    mediaQuery?.addEventListener?.('change', () => {
      if (this.currentSnapshot.mode === 'system') {
        this.currentSnapshot = this.createSnapshot(this.currentSnapshot.world, 'system');
        applyDomAttributes(this.currentSnapshot.world, this.currentSnapshot.resolvedMode);
        this.notify();
      }
    });
  }

  private rehydrateFromStorage(): void {
    const world = readStoredWorld();
    const mode = readStoredMode();
    this.currentSnapshot = this.createSnapshot(world, mode);
    applyDomAttributes(this.currentSnapshot.world, this.currentSnapshot.resolvedMode);
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private broadcast(): void {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'WORLD_THEME_SYNC', timestamp: Date.now() });
      } catch {
        // BroadcastChannel delivery failed silently
      }
    }
  }

  public getSnapshot = (): WorldThemeSnapshot => {
    if (!this.initialized && !isServer()) {
      this.initClient();
    }
    return this.currentSnapshot;
  };

  public getServerSnapshot = (): WorldThemeSnapshot => {
    return SERVER_SNAPSHOT;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.initClient();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public setWorld(nextWorld: WorldId): void {
    this.initClient();
    try {
      localStorage.setItem(WORLD_KEY, nextWorld);
    } catch {}

    this.currentSnapshot = this.createSnapshot(nextWorld, this.currentSnapshot.mode);
    applyDomAttributes(this.currentSnapshot.world, this.currentSnapshot.resolvedMode);
    this.notify();
    this.broadcast();

    if (!isServer()) {
      window.dispatchEvent(new CustomEvent(WORLD_CHANGED_EVENT, { detail: { world: nextWorld } }));
    }
  }

  public setMode(nextMode: LuminanceMode): void {
    this.initClient();
    try {
      localStorage.setItem(MODE_KEY, nextMode);
    } catch {}

    this.currentSnapshot = this.createSnapshot(this.currentSnapshot.world, nextMode);
    applyDomAttributes(this.currentSnapshot.world, this.currentSnapshot.resolvedMode);
    this.notify();
    this.broadcast();

    if (!isServer()) {
      window.dispatchEvent(new CustomEvent(MODE_CHANGED_EVENT, { detail: { mode: nextMode } }));
    }
  }
}

export const worldThemeStore = new WorldThemeStore();

export function useWorldTheme() {
  const snapshot = useSyncExternalStore(
    worldThemeStore.subscribe,
    worldThemeStore.getSnapshot,
    worldThemeStore.getServerSnapshot,
  );

  return {
    world: snapshot.world,
    mode: snapshot.mode,
    resolvedMode: snapshot.resolvedMode,
    isDark: snapshot.resolvedMode === 'dark',
    setWorld: (world: WorldId) => worldThemeStore.setWorld(world),
    setMode: (mode: LuminanceMode) => worldThemeStore.setMode(mode),
  };
}
