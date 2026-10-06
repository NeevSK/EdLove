import { describe, expect, it } from 'vitest';

import { getGuestClaimIdentity, type LocalGuestIdentity } from './guestIdentity';

function identity(overrides: Partial<LocalGuestIdentity> = {}): LocalGuestIdentity {
  return {
    id: 'guest-1',
    email: null,
    display_name: 'Guest Name',
    availableBonds: [],
    activeBond: null,
    onboarding_completed: true,
    citizenship: 'THIRD_CLASS',
    ...overrides,
  };
}

describe('getGuestClaimIdentity', () => {
  it('uses the local active bond capacity instead of a claim-time default', () => {
    expect(
      getGuestClaimIdentity(
        identity({
          activeBond: {
            id: 'guest-bond-1',
            user_id: 'guest-1',
            entity_id: 'personal-guest-1',
            entity_type: 'PERSONAL_CLASSROOM',
            capacity: 'guardian',
            status: 'active',
          },
        }),
      ),
    ).toEqual({ displayName: 'Guest Name', capacity: 'guardian' });
  });

  it('refuses an invalid or absent local capacity', () => {
    expect(getGuestClaimIdentity(identity())).toEqual({ displayName: 'Guest Name', capacity: null });
    expect(
      getGuestClaimIdentity(
        identity({
          activeBond: {
            id: 'guest-bond-1',
            user_id: 'guest-1',
            entity_id: 'personal-guest-1',
            entity_type: 'PERSONAL_CLASSROOM',
            capacity: 'unknown',
            status: 'active',
          },
        }),
      ),
    ).toEqual({ displayName: 'Guest Name', capacity: null });
  });
});

describe('migrateGuestDataToAuthenticatedUser', () => {
  it('preserves activeBond and deduplicates availableBonds during migration', async () => {
    const { updateLocalGuestIdentity, migrateGuestDataToAuthenticatedUser, getLocalGuestIdentity } = await import(
      './guestIdentity'
    );

    // Seed guest
    await updateLocalGuestIdentity('test-guest-uid', {
      display_name: 'Guest Explorer',
      onboarding_completed: true,
      activeBond: {
        id: 'guest-bond-1',
        user_id: 'test-guest-uid',
        entity_id: 'classroom-42',
        entity_type: 'PERSONAL_CLASSROOM',
        capacity: 'student',
        status: 'active',
      },
      availableBonds: [
        {
          id: 'guest-bond-1',
          user_id: 'test-guest-uid',
          entity_id: 'classroom-42',
          entity_type: 'PERSONAL_CLASSROOM',
          capacity: 'student',
          status: 'active',
        },
      ],
    });

    // Seed target authenticated user with an existing bond
    await updateLocalGuestIdentity('test-auth-uid', {
      display_name: 'Auth Citizen',
      availableBonds: [
        {
          id: 'existing-bond',
          user_id: 'test-auth-uid',
          entity_id: 'classroom-99',
          entity_type: 'PERSONAL_CLASSROOM',
          capacity: 'teacher',
          status: 'active',
        },
      ],
      activeBond: null,
    });

    const migrated = await migrateGuestDataToAuthenticatedUser('test-auth-uid', 'test-guest-uid');

    expect(migrated.activeBond).toEqual({
      id: 'guest-bond-1',
      user_id: 'test-auth-uid',
      entity_id: 'classroom-42',
      entity_type: 'PERSONAL_CLASSROOM',
      capacity: 'student',
      status: 'active',
    });
    expect(migrated.availableBonds).toHaveLength(2);
    expect(migrated.availableBonds.map((b) => b.entity_id)).toEqual(['classroom-99', 'classroom-42']);

    // Check that repeated migration does not duplicate bonds
    await updateLocalGuestIdentity('test-guest-uid', {
      availableBonds: [
        {
          id: 'duplicate-bond',
          user_id: 'test-guest-uid',
          entity_id: 'classroom-42',
          entity_type: 'PERSONAL_CLASSROOM',
          capacity: 'student',
          status: 'active',
        },
      ],
    });
    const remigrated = await migrateGuestDataToAuthenticatedUser('test-auth-uid', 'test-guest-uid');
    expect(remigrated.availableBonds).toHaveLength(2);

    // Check that guest was cleared
    const clearedGuest = await getLocalGuestIdentity('test-guest-uid');
    expect(clearedGuest.display_name).toBe('');
    expect(clearedGuest.availableBonds).toEqual([]);
  });
});
