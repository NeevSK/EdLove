'use client';

import { DEFAULT_WORLD, isWorldId, type WorldId } from '@repo/ui/theme';
import { useSyncExternalStore } from 'react';

export type PersonalityTheme = 'sanctuary' | 'lotus' | 'youth' | 'garden';
export type LuminanceMode = 'light' | 'dark' | 'system';
export type ResolvedLuminance = 'light' | 'dark';

export interface WorldThemeSnapshot {
  readonly world: WorldId;
  readonly theme: PersonalityTheme;
  readonly mode: LuminanceMode;
  readonly resolvedMode: ResolvedLuminance;
}

const WORLD_KEY = 'gurudevi_world';
const THEME_KEY = 'gurudevi_theme';
const MODE_KEY = 'gurudevi_mode';
const APPEARANCE_PRESET_KEY = 'gurudevi_appearance_preset';

export const WORLD_THEME_BUS = 'gurudevi_world_theme_bus';
export const WORLD_CHANGED_EVENT = 'gurudevi:world-changed';
export const THEME_CHANGED_EVENT = 'gurudevi:theme-changed';

const VALID_THEMES: readonly PersonalityTheme[] = ['sanctuary', 'lotus', 'youth', 'garden'];
const VALID_MODES: readonly LuminanceMode[] = ['light', 'dark', 'system'];

const SERVER_SNAPSHOT: WorldThemeSnapshot = {
  world: DEFAULT_WORLD,
  theme: 'sanctuary',
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

function readStoredThemeAndMode(): { theme: PersonalityTheme; mode: LuminanceMode } {
  if (isServer()) return { theme: 'sanctuary', mode: 'system' };
  try {
    const savedTheme = localStorage.getItem(THEME_KEY) as PersonalityTheme | null;
    const savedMode = localStorage.getItem(MODE_KEY) as LuminanceMode | null;
    const legacyPreset = localStorage.getItem(APPEARANCE_PRESET_KEY);

    let theme: PersonalityTheme = 'sanctuary';
    let mode: LuminanceMode = 'system';

    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
      theme = savedTheme;
    } else if (legacyPreset === 'garden' || legacyPreset === 'dawn') {
      theme = legacyPreset === 'garden' ? 'garden' : 'sanctuary';
    }

    if (savedMode && VALID_MODES.includes(savedMode)) {
      mode = savedMode;
    } else if (legacyPreset === 'night') {
      mode = 'dark';
    }

    return { theme, mode };
  } catch {
    return { theme: 'sanctuary', mode: 'system' };
  }
}

function applyDomAttributes(
  world: WorldId,
  theme: PersonalityTheme,
  resolvedMode: ResolvedLuminance,
): void {
  if (isServer() || typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-world', world);
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-mode', resolvedMode);
  root.setAttribute('data-appearance', resolvedMode === 'dark' ? 'night' : theme);
}

class WorldThemeStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: WorldThemeSnapshot = SERVER_SNAPSHOT;
  private channel: BroadcastChannel | null = null;
  private initialized = false;

  private createSnapshot(
    world: WorldId,
    theme: PersonalityTheme,
    mode: LuminanceMode,
  ): WorldThemeSnapshot {
    const resolvedMode = resolveMode(mode);
    return { world, theme, mode, resolvedMode };
  }

  private initClient(): void {
    if (this.initialized || isServer()) return;
    this.initialized = true;

    const world = readStoredWorld();
    const { theme, mode } = readStoredThemeAndMode();
    this.currentSnapshot = this.createSnapshot(world, theme, mode);
    applyDomAttributes(
      this.currentSnapshot.world,
      this.currentSnapshot.theme,
      this.currentSnapshot.resolvedMode,
    );

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
      if (
        event.key === WORLD_KEY ||
        event.key === THEME_KEY ||
        event.key === MODE_KEY ||
        event.key === APPEARANCE_PRESET_KEY
      ) {
        this.rehydrateFromStorage();
      }
    });

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    mediaQuery?.addEventListener?.('change', () => {
      if (this.currentSnapshot.mode === 'system') {
        this.currentSnapshot = this.createSnapshot(
          this.currentSnapshot.world,
          this.currentSnapshot.theme,
          'system',
        );
        applyDomAttributes(
          this.currentSnapshot.world,
          this.currentSnapshot.theme,
          this.currentSnapshot.resolvedMode,
        );
        this.notify();
      }
    });
  }

  private rehydrateFromStorage(): void {
    const world = readStoredWorld();
    const { theme, mode } = readStoredThemeAndMode();
    this.currentSnapshot = this.createSnapshot(world, theme, mode);
    applyDomAttributes(
      this.currentSnapshot.world,
      this.currentSnapshot.theme,
      this.currentSnapshot.resolvedMode,
    );
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

    // When choosing a world, standard palette reverts to clean sanctuary theme
    this.currentSnapshot = this.createSnapshot(nextWorld, 'sanctuary', this.currentSnapshot.mode);
    applyDomAttributes(
      this.currentSnapshot.world,
      this.currentSnapshot.theme,
      this.currentSnapshot.resolvedMode,
    );
    this.notify();
    this.broadcast();

    if (!isServer()) {
      window.dispatchEvent(new CustomEvent(WORLD_CHANGED_EVENT, { detail: { world: nextWorld } }));
    }
  }

  public setThemeAndMode(nextTheme: PersonalityTheme, nextMode: LuminanceMode): void {
    this.initClient();
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
      localStorage.setItem(MODE_KEY, nextMode);
    } catch {}

    this.currentSnapshot = this.createSnapshot(this.currentSnapshot.world, nextTheme, nextMode);
    applyDomAttributes(
      this.currentSnapshot.world,
      this.currentSnapshot.theme,
      this.currentSnapshot.resolvedMode,
    );
    this.notify();
    this.broadcast();

    if (!isServer()) {
      window.dispatchEvent(
        new CustomEvent(THEME_CHANGED_EVENT, { detail: { theme: nextTheme, mode: nextMode } }),
      );
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
    theme: snapshot.theme,
    mode: snapshot.mode,
    resolvedMode: snapshot.resolvedMode,
    isDark: snapshot.resolvedMode === 'dark',
    setWorld: (world: WorldId) => worldThemeStore.setWorld(world),
    setThemeAndMode: (theme: PersonalityTheme, mode: LuminanceMode) =>
      worldThemeStore.setThemeAndMode(theme, mode),
  };
}
