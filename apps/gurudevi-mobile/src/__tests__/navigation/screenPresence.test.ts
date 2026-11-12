import { GROUND_POLICY, screenPresence } from '@repo/ui/theme/scene';
import { describe, expect, it } from 'vitest';
import { screenKindForPath } from '@/components/shell/screenPresence';

describe('screenKindForPath', () => {
  it('names a room home, a page inside a room, and focused work', () => {
    expect(screenKindForPath('/library', { roomRoot: true })).toBe('home');
    expect(screenKindForPath('/community/', { roomRoot: true })).toBe('home');
    expect(screenKindForPath('/library/shelf', { roomRoot: false })).toBe('inside');
    expect(screenKindForPath('/settings', { roomRoot: true })).toBe('focus');
    expect(screenKindForPath('/notifications/', { roomRoot: true })).toBe('focus');
    expect(screenKindForPath('/settingsx', { roomRoot: true })).toBe('home');
  });
});

describe('ground policy', () => {
  it('lets the person choose how loud the ground is, and calm never shows more', () => {
    expect(screenPresence('focus', 'balanced')).toBe('quiet');
    expect(screenPresence('focus', 'lively')).toBe('band');
    expect(screenPresence('home', 'calm')).toBe('band');
    const order = { full: 0, band: 1, quiet: 2 } as const;
    for (const kind of ['home', 'inside', 'focus'] as const) {
      const p = GROUND_POLICY.presence;
      expect(order[p.calm[kind]]).toBeGreaterThanOrEqual(order[p.balanced[kind]]);
      expect(order[p.balanced[kind]]).toBeGreaterThanOrEqual(order[p.lively[kind]]);
    }
    expect(GROUND_POLICY.quietVeil.calm).toBeGreaterThanOrEqual(GROUND_POLICY.quietVeil.lively);
  });
});
