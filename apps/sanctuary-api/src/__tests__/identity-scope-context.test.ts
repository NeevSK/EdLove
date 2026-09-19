import { describe, expect, it, vi } from 'vitest';
import type { ScopeBond } from '../core/activeScope';
import {
  persistPersonalSanctuaryBondCapacity,
  resolvePersistedActiveBond,
} from '../core/activeScope';
import { isOnboardingBootstrapProcedure } from '../core/onboardingBootstrap';

const userId = '00000000-0000-4000-8000-000000000001';
const now = new Date('2026-09-15T10:00:00.000Z');
const activeBond: ScopeBond = {
  id: '00000000-0000-4000-8000-000000000010',
  user_id: userId,
  entity_id: 'personal-sanctuary-1',
  entity_type: 'PERSONAL_CLASSROOM',
  capacity: 'student',
  status: 'active',
  valid_from: new Date('2026-09-01T00:00:00.000Z'),
  valid_until: null,
  metadata: {},
};

describe('persisted active scope boundary', () => {
  it('creates the chosen capacity initially and requires confirmation to update only that personal bond', async () => {
    const create = vi.fn(async ({ data }: { data: Partial<ScopeBond> }) => ({
      ...activeBond,
      ...data,
    }));
    const update = vi.fn(async ({ data }: { data: Partial<ScopeBond> }) => ({
      ...activeBond,
      ...data,
    }));
    const writer = { create, update };

    const initial = await persistPersonalSanctuaryBondCapacity(
      writer,
      null,
      userId,
      'personal-sanctuary-1',
      'student',
      true,
    );
    expect(initial.capacity).toBe('student');
    expect(create).toHaveBeenCalledWith({
      data: {
        user_id: userId,
        entity_id: 'personal-sanctuary-1',
        entity_type: 'PERSONAL_CLASSROOM',
        capacity: 'student',
        metadata: { source: 'initial_personal_sanctuary' },
      },
    });

    create.mockClear();
    const unconfirmed = await persistPersonalSanctuaryBondCapacity(
      writer,
      activeBond,
      userId,
      'personal-sanctuary-1',
      'teacher',
      false,
    );
    expect(unconfirmed.capacity).toBe('student');
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();

    const confirmed = await persistPersonalSanctuaryBondCapacity(
      writer,
      activeBond,
      userId,
      'personal-sanctuary-1',
      'teacher',
      true,
    );
    expect(confirmed.capacity).toBe('teacher');
    expect(update).toHaveBeenCalledExactlyOnceWith({
      where: { id: activeBond.id },
      data: { capacity: 'teacher' },
    });
    expect(create).not.toHaveBeenCalled();

    await expect(
      persistPersonalSanctuaryBondCapacity(
        writer,
        { ...activeBond, entity_id: 'school-1', entity_type: 'SCHOOL' },
        userId,
        'school-1',
        'principal',
        true,
      ),
    ).rejects.toThrow('caller-owned Personal Sanctuary bond');
    expect(update).toHaveBeenCalledExactlyOnceWith({
      where: { id: activeBond.id },
      data: { capacity: 'teacher' },
    });
  });

  it('resolves only the owned, active bond named by the server preference', async () => {
    const findFirst = vi.fn(async ({ where }: { where: { id: string; user_id: string } }) =>
      where.id === activeBond.id && where.user_id === userId ? activeBond : null,
    );
    const update = vi.fn(async () => ({}));
    const db = {
      userPreferences: {
        findUnique: async () => ({ active_bond_id: activeBond.id }),
        update,
      },
      bond: { findFirst },
    };

    const result = await resolvePersistedActiveBond(db, userId, now);

    expect(result?.id).toBe(activeBond.id);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: activeBond.id,
        user_id: userId,
        status: 'active',
        valid_from: { lte: now },
        OR: [{ valid_until: null }, { valid_until: { gt: now } }],
      },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('clears an invalid remembered pointer instead of falling back to another bond', async () => {
    const update = vi.fn(async () => ({}));
    const db = {
      userPreferences: {
        findUnique: async () => ({ active_bond_id: activeBond.id }),
        update,
      },
      bond: { findFirst: async () => null },
    };

    const result = await resolvePersistedActiveBond(db, userId, now);

    expect(result).toBeNull();
    expect(update).toHaveBeenCalledWith({
      where: { user_id: userId },
      data: { active_bond_id: null },
    });
  });

  it('allows no-scope identity bootstrap and explicit selection, not ordinary routes', () => {
    expect(isOnboardingBootstrapProcedure('/api/identity/resolveIdentity')).toBe(true);
    expect(isOnboardingBootstrapProcedure('/api/identity/active-scope')).toBe(true);
    expect(isOnboardingBootstrapProcedure('/api/self/journal')).toBe(false);
  });
});
