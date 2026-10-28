import { describe, expect, it, vi } from 'vitest';
import { isolatedVergerMode } from '@/runtime/runtimeMode';

vi.mock('expo-application', () => ({ getAndroidId: () => null }));

describe('isolated development Verger mode', () => {
  it('keeps the existing shadow option and explicitly enables active experiments', () => {
    expect(isolatedVergerMode('true', true)).toBe('shadow');
    expect(isolatedVergerMode('active', true)).toBe('active');
    expect(isolatedVergerMode(undefined, true)).toBeNull();
    expect(isolatedVergerMode('active', false)).toBeNull();
  });
});
