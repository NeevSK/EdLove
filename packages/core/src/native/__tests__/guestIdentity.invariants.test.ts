import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  clearLocalGuestIdentity,
  getLocalGuestIdentity,
  type LocalGuestBond,
  type LocalGuestIdentity,
  migrateGuestDataToAuthenticatedUser,
  updateLocalGuestIdentity,
} from '../guestIdentity';

// Generator for arbitrary LocalGuestBond
const bondArbitrary = (userId: string) =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.constant(userId),
    entity_id: fc.stringMatching(/^classroom-[a-z0-9]{4,8}$/),
    entity_type: fc.constant('PERSONAL_CLASSROOM' as const),
    capacity: fc.constantFrom('student', 'teacher', 'guardian', 'principal'),
    status: fc.constant('active' as const),
  });

// Generator for arbitrary LocalGuestIdentity
const identityArbitrary = (userId: string) =>
  fc.record({
    id: fc.constant(userId),
    email: fc.constant(null),
    display_name: fc.string({ minLength: 0, maxLength: 30 }),
    availableBonds: fc.array(bondArbitrary(userId), { minLength: 0, maxLength: 5 }),
    activeBond: fc.option(bondArbitrary(userId), { nil: null }),
    onboarding_completed: fc.boolean(),
    citizenship: fc.constant('THIRD_CLASS' as const),
  });

describe('Guest Identity Invariants (Property-Based Verification)', {
  timeout: 15000,
}, () => {
  it('Property: Idempotency — repeated migrations preserve exact state f(f(x)) = f(x)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // guestId
        fc.uuid(), // authUserId
        async (guestId, authUserId) => {
          fc.pre(guestId !== authUserId);

          // Seed identities
          await updateLocalGuestIdentity(guestId, {
            display_name: 'Guest Traveler',
            availableBonds: [
              {
                id: 'bond-1',
                user_id: guestId,
                entity_id: 'classroom-alpha',
                entity_type: 'PERSONAL_CLASSROOM',
                capacity: 'student',
                status: 'active',
              },
            ],
            activeBond: null,
          });

          await updateLocalGuestIdentity(authUserId, {
            display_name: 'Auth Citizen',
            availableBonds: [],
            activeBond: null,
          });

          // Run Migration 1
          const run1 = await migrateGuestDataToAuthenticatedUser(authUserId, guestId);

          // Re-seed same guest data to simulate repeat sync attempt
          await updateLocalGuestIdentity(guestId, {
            display_name: 'Guest Traveler',
            availableBonds: [
              {
                id: 'bond-1',
                user_id: guestId,
                entity_id: 'classroom-alpha',
                entity_type: 'PERSONAL_CLASSROOM',
                capacity: 'student',
                status: 'active',
              },
            ],
          });

          // Run Migration 2
          const run2 = await migrateGuestDataToAuthenticatedUser(authUserId, guestId);

          // Assert idempotency: bond length and IDs must remain identical
          expect(run2.availableBonds.length).toBe(run1.availableBonds.length);
          expect(run2.availableBonds.map((b) => b.entity_id)).toEqual(
            run1.availableBonds.map((b) => b.entity_id),
          );

          // Cleanup
          await clearLocalGuestIdentity(guestId);
          await clearLocalGuestIdentity(authUserId);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('Property: Zero Data Loss — all distinct entity IDs are conserved in target user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.stringMatching(/^entity-[0-9]{3}$/), { minLength: 0, maxLength: 4 }),
        fc.array(fc.stringMatching(/^entity-[0-9]{3}$/), { minLength: 0, maxLength: 4 }),
        async (guestId, authUserId, guestEntityIds, authEntityIds) => {
          fc.pre(guestId !== authUserId);

          const guestBonds: LocalGuestBond[] = guestEntityIds.map((eid, idx) => ({
            id: `g-bond-${idx}`,
            user_id: guestId,
            entity_id: eid,
            entity_type: 'PERSONAL_CLASSROOM',
            capacity: 'student',
            status: 'active',
          }));

          const authBonds: LocalGuestBond[] = authEntityIds.map((eid, idx) => ({
            id: `a-bond-${idx}`,
            user_id: authUserId,
            entity_id: eid,
            entity_type: 'PERSONAL_CLASSROOM',
            capacity: 'teacher',
            status: 'active',
          }));

          await updateLocalGuestIdentity(guestId, { availableBonds: guestBonds });
          await updateLocalGuestIdentity(authUserId, { availableBonds: authBonds });

          const migrated = await migrateGuestDataToAuthenticatedUser(authUserId, guestId);

          const expectedEntities = new Set([...authEntityIds, ...guestEntityIds]);
          const actualEntities = new Set(migrated.availableBonds.map((b) => b.entity_id));

          expect(actualEntities).toEqual(expectedEntities);

          // Cleanup
          await clearLocalGuestIdentity(guestId);
          await clearLocalGuestIdentity(authUserId);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('Property: Strict User Isolation — no guest user ID leaks into authenticated bonds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        fc.array(fc.stringMatching(/^entity-[0-9]{3}$/), { minLength: 1, maxLength: 3 }),
        async (guestId, authUserId, entityIds) => {
          fc.pre(guestId !== authUserId);

          const guestBonds: LocalGuestBond[] = entityIds.map((eid, idx) => ({
            id: `g-bond-${idx}`,
            user_id: guestId,
            entity_id: eid,
            entity_type: 'PERSONAL_CLASSROOM',
            capacity: 'student',
            status: 'active',
          }));

          await updateLocalGuestIdentity(guestId, {
            availableBonds: guestBonds,
            activeBond: guestBonds[0] ?? null,
          });
          await updateLocalGuestIdentity(authUserId, { availableBonds: [], activeBond: null });

          const migrated = await migrateGuestDataToAuthenticatedUser(authUserId, guestId);

          // Every bond in availableBonds MUST be owned by authUserId
          for (const bond of migrated.availableBonds) {
            expect(bond.user_id).toBe(authUserId);
          }

          // Active bond MUST be owned by authUserId
          if (migrated.activeBond) {
            expect(migrated.activeBond.user_id).toBe(authUserId);
          }

          // Cleanup
          await clearLocalGuestIdentity(guestId);
          await clearLocalGuestIdentity(authUserId);
        },
      ),
      { numRuns: 50 },
    );
  });
});
