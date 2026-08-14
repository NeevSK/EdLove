import { clampReorderIndex, resolveDragTranslation, resolveReorderTarget } from '@repo/ui/components/workspace/reorder';
import { describe, expect, it } from 'vitest';

describe('workspace canvas interaction contracts', () => {
  it('keeps phone drag movement on one vertical axis', () => {
    expect(resolveDragTranslation('vertical', { x: 80, y: 120 })).toEqual({ x: 0, y: 120 });
  });

  it('preserves unrestricted movement for non-phone renderers', () => {
    expect(resolveDragTranslation('both', { x: 80, y: 120 })).toEqual({ x: 80, y: 120 });
  });

  it('bounds reorder fallback to the current zone', () => {
    expect(clampReorderIndex(0, -2, 3)).toBe(0);
    expect(clampReorderIndex(2, 4, 3)).toBe(2);
    expect(clampReorderIndex(1, -1, 3)).toBe(0);
  });

  it('resolves keyboard and pointer fallback moves to adjacent positions', () => {
    expect(resolveReorderTarget(1, -1, 3)).toBe(0);
    expect(resolveReorderTarget(1, 1, 3)).toBe(2);
    expect(resolveReorderTarget(0, -1, 3)).toBe(0);
    expect(resolveReorderTarget(2, 1, 3)).toBe(2);
  });
});
