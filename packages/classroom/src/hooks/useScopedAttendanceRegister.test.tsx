import { describe, expect, it } from 'vitest';

import { abortableQueryRead } from '@repo/core/lib/clientStateFoundation';

import {
  nativeAttendanceCache,
  resolveNativeAttendanceScope,
} from './useScopedAttendanceRegister';

describe('useScopedAttendanceRegister', () => {
  it('partitions native register cache by principal, bond, entity, class, and date', () => {
    const base = resolveNativeAttendanceScope({
      principalId: 'principal-a',
      tenantId: 'school-a',
      activeBond: { id: 'bond-a' },
      activePerspective: { id: 'perspective-a' },
    });
    const other = resolveNativeAttendanceScope({
      principalId: 'principal-b',
      tenantId: 'school-b',
      activeBond: { id: 'bond-b' },
      activePerspective: { id: 'perspective-b' },
    });
    if (!base || !other) throw new Error('scope missing');
    expect(nativeAttendanceCache.register(base, 'class-a', '2026-10-24')).not.toEqual(
      nativeAttendanceCache.register(other, 'class-a', '2026-10-24'),
    );
    expect(nativeAttendanceCache.register(base, 'class-a', '2026-10-24')).not.toEqual(
      nativeAttendanceCache.register(base, 'class-b', '2026-10-24'),
    );
    const otherPerspective = resolveNativeAttendanceScope({
      principalId: 'principal-a',
      tenantId: 'school-a',
      activeBond: { id: 'bond-a' },
      activePerspective: { id: 'perspective-b' },
    });
    if (!otherPerspective) throw new Error('perspective scope missing');
    expect(nativeAttendanceCache.register(base, 'class-a', '2026-10-24')).not.toEqual(
      nativeAttendanceCache.register(otherPerspective, 'class-a', '2026-10-24'),
    );
  });

  it('rejects incomplete session facts rather than creating an unscoped key', () => {
    expect(
      resolveNativeAttendanceScope({
        principalId: 'principal-a',
        tenantId: null,
        activeBond: { id: 'bond-a' },
        activePerspective: { id: 'perspective-a' },
      }),
    ).toBeNull();
    expect(
      resolveNativeAttendanceScope({
        principalId: 'principal-a',
        tenantId: 'school-a',
        activeBond: null,
        activePerspective: { id: 'perspective-a' },
      }),
    ).toBeNull();
  });

  it('rejects the consumer promise when TanStack Query cancels an in-flight read', async () => {
    const controller = new AbortController();
    const pending = abortableQueryRead(controller.signal, () => new Promise(() => {}));
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
