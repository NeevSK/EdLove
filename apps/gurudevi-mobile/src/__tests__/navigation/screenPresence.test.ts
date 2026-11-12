import { describe, expect, it } from 'vitest';
import { presenceForPath } from '@/components/shell/screenPresence';

describe('presenceForPath', () => {
  it('shows the ground in full on a room home', () => {
    expect(presenceForPath('/library', { roomRoot: true })).toBe('full');
    expect(presenceForPath('/community/', { roomRoot: true })).toBe('full');
  });

  it('shows a band inside a room', () => {
    expect(presenceForPath('/library/shelf', { roomRoot: false })).toBe('band');
  });

  it('calms focused work even where no room claims the screen', () => {
    expect(presenceForPath('/settings', { roomRoot: true })).toBe('quiet');
    expect(presenceForPath('/notifications/', { roomRoot: true })).toBe('quiet');
    expect(presenceForPath('/settingsx', { roomRoot: true })).toBe('full');
  });
});
