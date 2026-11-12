import { groundPolicyOf } from '@repo/core/logic/workspace/groundPlan';
import { screenPresence } from '@repo/ui/theme/scene';
import { describe, expect, it } from 'vitest';
import { groundStageForPath } from '@/components/shell/screenPresence';

describe('groundStageForPath', () => {
  it('names a room home, a page inside a room, and focused work', () => {
    expect(groundStageForPath('/library', { roomRoot: true })).toBe('room');
    expect(groundStageForPath('/community/', { roomRoot: true })).toBe('room');
    expect(groundStageForPath('/library/shelf', { roomRoot: false })).toBe('screen');
    expect(groundStageForPath('/settings', { roomRoot: true })).toBe('focus');
    expect(groundStageForPath('/notifications/', { roomRoot: true })).toBe('focus');
    expect(groundStageForPath('/settingsx', { roomRoot: true })).toBe('room');
  });
});

describe('phone reading of the ground policy', () => {
  it('follows the person’s choice', () => {
    expect(screenPresence('room', groundPolicyOf({ liveliness: 'balanced' }))).toBe('full');
    expect(screenPresence('screen', groundPolicyOf({ liveliness: 'balanced' }))).toBe('band');
    expect(screenPresence('focus', groundPolicyOf({ liveliness: 'balanced' }))).toBe('quiet');
    expect(screenPresence('focus', groundPolicyOf({ liveliness: 'lively' }))).toBe('band');
    expect(screenPresence('screen', groundPolicyOf({ liveliness: 'calm' }))).toBe('quiet');
  });
});
