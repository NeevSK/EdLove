import {
  clearSchoolDraftSnapshot,
  createSchoolProvisioningActor,
  type ProvisionSchoolInput,
  type ProvisionSchoolResult,
  resolveSchoolDraftKey,
  restoreSchoolDraftSnapshot,
  saveSchoolDraftSnapshot,
  schoolProvisioningMachine,
} from '../../machines/schoolProvisioningMachine';
import { describe, expect, it, vi } from 'vitest';
import { createAsyncLogic, waitFor } from 'xstate';

vi.mock('@repo/core/lib/storage.adapter', () => {
  const store = new Map<string, string>();
  return {
    buildPartitionedKey: vi.fn(
      ({ tenantId, userId, entityId, feature }) =>
        `sanctuary:${tenantId || 'global'}:${userId || 'anon'}:${entityId || 'root'}:${feature}`,
    ),
    storage: {
      getStringAsync: vi.fn(async (key: string) => store.get(key) ?? null),
      setAsync: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      deleteAsync: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: () => store.clear(),
    },
  };
});

/** The machine with its two server calls provided: no network. */
function withPorts(
  available: (handle: string) => Promise<boolean> = async () => true,
  provision: (input: ProvisionSchoolInput) => Promise<ProvisionSchoolResult> = async () => ({
    schoolId: 'sch-1',
    groupId: 'grp-1',
  }),
) {
  return schoolProvisioningMachine.provide({
    actors: {
      checkHandle: createAsyncLogic<boolean, { handle: string }>({
        run: ({ input }) => available(input.handle),
      }),
      provision: createAsyncLogic<ProvisionSchoolResult, ProvisionSchoolInput>({
        run: ({ input }) => provision(input),
      }),
    },
  });
}

function submitted(machine = withPorts()) {
  const actor = createSchoolProvisioningActor(undefined, machine);
  actor.send({ type: 'SET_DETAILS', name: 'Royal Academy', handle: 'royal-acad' });
  actor.send({ type: 'SET_TYPE', schoolType: 'k12' });
  actor.send({ type: 'SUBMIT' });
  return actor;
}

describe('schoolProvisioningMachine / G1, real XState, server calls provided', () => {
  it('happy path reaches activated with school and group IDs', async () => {
    const actor = submitted();
    const final = await waitFor(actor, (s) => s.matches('activated'));
    expect(final.context.schoolId).toBe('sch-1');
    expect(final.context.groupId).toBe('grp-1');
    expect(final.context.groupCreationFailed).toBe(false);
  });

  it('generates an idempotency key on submit and reuses it across retries', async () => {
    const keys: string[] = [];
    const machine = withPorts(
      async () => true,
      async (input) => {
        keys.push(input.idempotencyKey);
        if (keys.length === 1) throw new Error('First attempt dropped');
        return { schoolId: 'sch-1' };
      },
    );
    const actor = submitted(machine);
    await waitFor(actor, (s) => s.matches('error'));
    actor.send({ type: 'RETRY' });
    await waitFor(actor, (s) => s.matches('activated'));

    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it('generates a fresh idempotency key when details change', () => {
    const actor = createSchoolProvisioningActor(undefined, withPorts());
    actor.send({ type: 'SET_DETAILS', name: 'First Name' });
    actor.send({ type: 'SUBMIT' });
    const firstKey = actor.getSnapshot().context.idempotencyKey;

    actor.send({ type: 'SET_DETAILS', name: 'Second Name' });
    expect(actor.getSnapshot().context.idempotencyKey).toBeNull();
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().context.idempotencyKey).not.toBe(firstKey);
  });

  it('rejects an empty school name and stays in details with an error message', () => {
    const actor = createSchoolProvisioningActor(undefined, withPorts());
    actor.send({ type: 'SET_DETAILS', name: '   ' });
    actor.send({ type: 'SUBMIT' });
    const snap = actor.getSnapshot();
    expect(snap.matches('details')).toBe(true);
    expect(snap.context.error).toBe('School name is required');
  });

  it('returns to details with an error when the handle is already claimed', async () => {
    const actor = submitted(withPorts(async () => false));
    const snap = await waitFor(
      actor,
      (s) => s.matches('details') && s.context.error?.includes('already claimed') === true,
    );
    expect(snap.context.error).toContain('already claimed');
  });

  it('slugs the handle from the name when no handle is passed', () => {
    const actor = createSchoolProvisioningActor(undefined, withPorts());
    actor.send({ type: 'SET_DETAILS', name: 'St. Thomas College' });
    expect(actor.getSnapshot().context.handle).toBe('st.-thomas-college');
  });

  it('unprovided machine fails with API_CAPABILITY_NOT_ADMITTED', async () => {
    const actor = submitted(schoolProvisioningMachine);
    const err = await waitFor(actor, (s) => s.matches('error'));
    expect(err.context.error).toContain('school.handleAvailable is not available yet');
  });

  it('activated records group creation failure without failing the school', async () => {
    const actor = submitted(
      withPorts(
        async () => true,
        async () => ({ schoolId: 'sch-1', groupFailed: true }),
      ),
    );
    const final = await waitFor(actor, (s) => s.matches('activated'));
    expect(final.context.schoolId).toBe('sch-1');
    expect(final.context.groupId).toBeNull();
    expect(final.context.groupCreationFailed).toBe(true);
  });

  it('saves and restores drafts through partitioned storage', async () => {
    const key = resolveSchoolDraftKey({ userId: 'u-123' });
    await clearSchoolDraftSnapshot(key);

    const draft = { name: 'Saved School', handle: 'saved-sch', type: 'primary' as const };
    await saveSchoolDraftSnapshot(key, draft);

    const restored = await restoreSchoolDraftSnapshot(key);
    expect(restored).toEqual(draft);

    await clearSchoolDraftSnapshot(key);
    expect(await restoreSchoolDraftSnapshot(key)).toBeNull();
  });

  it('RESET returns to details with clean error', async () => {
    const actor = submitted(
      withPorts(
        async () => true,
        async () => {
          throw new Error('Explosion');
        },
      ),
    );
    await waitFor(actor, (s) => s.matches('error'));
    actor.send({ type: 'RESET' });
    const snap = actor.getSnapshot();
    expect(snap.matches('details')).toBe(true);
    expect(snap.context.error).toBeNull();
  });
});
