import { WORLD_IDS } from '@repo/ui/theme';
import { afterEach, describe, expect, it } from 'vitest';
import { applySavedPreferences } from '@/lib/runtime/savedPreferences';

afterEach(() => {
  localStorage.clear();
  for (const attribute of [
    'data-world',
    'data-theme',
    'data-mode',
    'data-appearance',
    'data-phase',
    'data-density',
  ]) {
    document.documentElement.removeAttribute(attribute);
  }
});

describe('World selection before the first render (G1 / jsdom)', () => {
  it.each(WORLD_IDS)('restores the saved %s world from the canonical registry', (world) => {
    localStorage.setItem('gurudevi_world', world);
    applySavedPreferences();
    expect(document.documentElement.getAttribute('data-world')).toBe(world);
  });

  it('ignores unknown stored values and preserves the legacy appearance preference', () => {
    localStorage.setItem('gurudevi_world', 'unrecognized-world');
    localStorage.setItem('gurudevi_appearance_preset', 'night');
    applySavedPreferences();
    expect(document.documentElement.hasAttribute('data-world')).toBe(false);
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('picks the phase of the hour, as the scene clock does', () => {
    applySavedPreferences(document.documentElement, new Date(2026, 10, 13, 2));
    expect(document.documentElement.getAttribute('data-phase')).toBe('night');
  });
});
