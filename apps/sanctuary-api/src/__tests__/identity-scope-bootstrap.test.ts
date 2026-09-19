import { IdentityBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { onboardingORPCContract } from '@repo/core/api/onboarding.orpc.contract';
import { describe, expect, it } from 'vitest';
import type { ScopeBond, ScopeUser } from '../core/activeScope';
import { buildIdentityBootstrap, resolvePersonalCapacityChange } from '../core/activeScope';
import { resolveInitialBondAuthority } from '../core/platformBondProvision';

const now = new Date('2026-09-15T10:00:00.000Z');
const user: ScopeUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: null,
  full_name: 'Sanctuary Learner',
  display_name: 'Learner',
  first_name: 'Sanctuary',
  last_name: 'Learner',
  onboarding_completed: false,
  capacity: 'teacher',
};

function bond(overrides: Partial<ScopeBond> = {}): ScopeBond {
  return {
    id: '00000000-0000-4000-8000-000000000010',
    user_id: user.id,
    entity_id: 'personal-sanctuary-1',
    entity_type: 'PERSONAL_CLASSROOM',
    capacity: 'student',
    status: 'active',
    valid_from: new Date('2026-09-01T00:00:00.000Z'),
    valid_until: null,
    metadata: {},
    ...overrides,
  };
}

describe('versioned identity scope bootstrap', () => {
  it('defaults capacity-change confirmation to No at the typed API boundary', () => {
    const parsed = onboardingORPCContract.createInitialBond.request.body.parse({
      orientation: 'student',
      context: { displayName: 'A', callerExtension: { acceptedAsUnknown: true } },
    });
    expect(parsed.confirmCapacityChange).toBe(false);
    expect(parsed.context.callerExtension).toEqual({ acceptedAsUnknown: true });
  });

  it('persists the initial chosen capacity and requires explicit consent to change it later', () => {
    expect(resolvePersonalCapacityChange(null, 'student', false)).toEqual({
      capacity: 'student',
      updateBond: true,
    });
    expect(resolvePersonalCapacityChange('student', 'teacher', false)).toEqual({
      capacity: 'student',
      updateBond: false,
    });
    expect(resolvePersonalCapacityChange('student', 'teacher', true)).toEqual({
      capacity: 'teacher',
      updateBond: true,
    });
    expect(resolvePersonalCapacityChange('student', 'student', false)).toEqual({
      capacity: 'student',
      updateBond: false,
    });
  });

  it('does not infer selection from primary capacity or first available bond', () => {
    const personal = bond();
    const result = buildIdentityBootstrap(user, [personal], null, now);

    expect(result.scopeBootstrap).toEqual({
      version: 1,
      userId: user.id,
      name: 'Learner',
      primaryCapacity: null,
      selection: 'needs_selection',
      activeScope: null,
    });
    expect(result.activeBond).toBeNull();
  });

  it('combines only currently valid roles in the explicitly selected perspective', () => {
    const selected = bond();
    const otherRole = bond({
      id: '00000000-0000-4000-8000-000000000011',
      capacity: 'teacher',
    });
    const otherPerspective = bond({
      id: '00000000-0000-4000-8000-000000000012',
      entity_id: 'school-1',
      entity_type: 'SCHOOL',
      capacity: 'student',
    });
    const archived = bond({
      id: '00000000-0000-4000-8000-000000000013',
      capacity: 'guardian',
      status: 'archived',
    });
    const expired = bond({
      id: '00000000-0000-4000-8000-000000000014',
      capacity: 'parent',
      valid_until: new Date('2026-09-15T09:59:59.000Z'),
    });
    const result = buildIdentityBootstrap(
      user,
      [selected, otherRole, otherPerspective, archived, expired],
      selected,
      now,
    );

    expect(result.scopeBootstrap.selection).toBe('selected');
    expect(result.scopeBootstrap.activeScope).toEqual({
      bondId: selected.id,
      entityId: selected.entity_id,
      entityType: selected.entity_type,
      roles: ['student', 'teacher'],
    });
    expect(result.scopeBootstrap.primaryCapacity).toBe(selected.capacity);
    expect(result.availableBonds.map(({ id }) => id)).toEqual([
      selected.id,
      otherRole.id,
      otherPerspective.id,
    ]);
    expect(IdentityBootstrapSchema.safeParse(result).success).toBe(true);
    expect(
      IdentityBootstrapSchema.safeParse({
        ...result,
        activeBond: { ...result.activeBond, clientAuthority: true },
      }).success,
    ).toBe(false);
  });
});

describe('server-provisioned platform roles', () => {
  it.each(['founder', 'developer'])(
    'denies client-requested privileged %s as an onboarding capacity',
    (orientation) => {
      const authority = resolveInitialBondAuthority(orientation, user.id, {
        environment: 'production',
        founderSubjects: user.id,
        developerSubjects: user.id,
      });

      expect(authority).toBeNull();
    },
  );

  it('keeps ordinary capacity scoped to Personal and projects configured founder only on Platform', () => {
    const authority = resolveInitialBondAuthority('student', user.id, {
      environment: 'production',
      founderSubjects: `other-subject, ${user.id}`,
      developerSubjects: undefined,
    });

    expect(authority?.personalBondCapacity).toBe('student');
    expect(authority?.platformCapacities).toEqual(['founder']);

    const personal = bond();
    const founder = bond({
      id: '00000000-0000-4000-8000-000000000015',
      entity_id: 'GLOBAL',
      entity_type: 'PLATFORM',
      capacity: 'founder',
    });
    const result = buildIdentityBootstrap(user, [personal, founder], founder, now);
    expect(result.scopeBootstrap.activeScope).toEqual({
      bondId: founder.id,
      entityId: 'GLOBAL',
      entityType: 'PLATFORM',
      roles: ['founder'],
    });
  });

  it('provisions developers only from server allowlists in Development or dogfood Production', () => {
    const config = {
      founderSubjects: undefined,
      developerSubjects: user.id,
    };

    expect(
      resolveInitialBondAuthority('developer', user.id, {
        ...config,
        environment: 'development',
      }),
    ).toBeNull();
    expect(
      resolveInitialBondAuthority('teacher', user.id, {
        ...config,
        environment: 'development',
      })?.platformCapacities,
    ).toEqual(['developer']);
    expect(
      resolveInitialBondAuthority('teacher', user.id, {
        ...config,
        environment: 'production',
      })?.platformCapacities,
    ).toEqual(['developer']);
    expect(
      resolveInitialBondAuthority('teacher', user.id, {
        environment: 'production',
        founderSubjects: undefined,
        developerSubjects: undefined,
      })?.platformCapacities,
    ).toEqual([]);
  });
});
