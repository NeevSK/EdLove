import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_WORLD } from '@repo/ui/theme';
import { MODE_CHANGED_EVENT, WORLD_CHANGED_EVENT, worldThemeStore } from './useWorldTheme';

describe('worldThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-world');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.removeAttribute('data-appearance');
  });

  it('provides the default world and system mode when unconfigured', () => {
    const snapshot = worldThemeStore.getSnapshot();
    expect(snapshot.world).toBe(DEFAULT_WORLD);
    expect(snapshot.mode).toBe('system');
    expect(snapshot.resolvedMode).toBe('light');
  });

  it('updates the world and sets data-world on setWorld while purging legacy attributes', () => {
    const listener = vi.fn();
    const unsubscribe = worldThemeStore.subscribe(listener);

    // Simulate pre-existing legacy DOM attributes
    document.documentElement.setAttribute('data-theme', 'lotus');
    document.documentElement.setAttribute('data-appearance', 'night');

    worldThemeStore.setWorld('wewa');

    expect(localStorage.getItem('gurudevi_world')).toBe('wewa');
    expect(document.documentElement.getAttribute('data-world')).toBe('wewa');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(document.documentElement.getAttribute('data-appearance')).toBeNull();
    expect(worldThemeStore.getSnapshot().world).toBe('wewa');
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it('updates mode and sets data-mode on setMode', () => {
    const listener = vi.fn();
    const unsubscribe = worldThemeStore.subscribe(listener);

    worldThemeStore.setMode('dark');

    expect(localStorage.getItem('gurudevi_mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(worldThemeStore.getSnapshot().mode).toBe('dark');
    expect(worldThemeStore.getSnapshot().resolvedMode).toBe('dark');

    unsubscribe();
  });
});
