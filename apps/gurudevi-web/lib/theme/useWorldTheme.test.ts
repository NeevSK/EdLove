import { beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_CHANGED_EVENT, WORLD_CHANGED_EVENT, worldThemeStore } from './useWorldTheme';

describe('worldThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-world');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.removeAttribute('data-appearance');
  });

  it('provides the default world and sanctuary theme when unconfigured', () => {
    const snapshot = worldThemeStore.getSnapshot();
    expect(snapshot.world).toBe('sanctuary');
    expect(snapshot.theme).toBe('sanctuary');
    expect(snapshot.mode).toBe('system');
  });

  it('updates the world and sets DOM attributes on setWorld', () => {
    const listener = vi.fn();
    const unsubscribe = worldThemeStore.subscribe(listener);

    worldThemeStore.setWorld('wewa');

    expect(localStorage.getItem('gurudevi_world')).toBe('wewa');
    expect(document.documentElement.getAttribute('data-world')).toBe('wewa');
    expect(worldThemeStore.getSnapshot().world).toBe('wewa');
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it('updates theme and mode and sets DOM attributes on setThemeAndMode', () => {
    const listener = vi.fn();
    const unsubscribe = worldThemeStore.subscribe(listener);

    worldThemeStore.setThemeAndMode('lotus', 'dark');

    expect(localStorage.getItem('gurudevi_theme')).toBe('lotus');
    expect(localStorage.getItem('gurudevi_mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('lotus');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-appearance')).toBe('night');
    expect(worldThemeStore.getSnapshot().resolvedMode).toBe('dark');

    unsubscribe();
  });
});
