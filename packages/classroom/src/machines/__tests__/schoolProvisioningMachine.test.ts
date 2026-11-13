import {
  clearSchoolDraftSnapshot,
  createSchoolProvisioningActor,
  type ProvisionSchoolInput,
  type ProvisionSchoolResult,
  resolveSchoolDraftKey,
  restoreSchoolDraftSnapshot,
  saveSchoolDraftSnapshot,
  schoolProvisioningMachine,
} from '@repo/classroom/machines/schoolProvisioningMachine';
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
  actor.send({ type: 'SET_DETAILS', name: 'Royal College' });
  actor.send({ type: 'SET_TYPE', schoolType: 'secondary' });
  actor.send({ type: 'SUBMIT' });
  return actor;
}

describe('schoolProvisioningMachine / G1, real XState, server calls provided', () => {
  it('starts in details with clean context', () => {
    const snapshot = createSchoolProvisioningActor(undefined, withPorts()).getSnapshot();
    expect(snapshot.value).toBe('details');
    expect(snapshot.context).toMatchObject({
      name: '',
      type: 'mixed',
      schoolId: null,
      idempotencyKey: null,
    });
  });

  it('rejects an empty school name on SUBMIT', () => {
    const actor = createSchoolProvisioningActor(undefined, withPorts());
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot()).toMatchObject({
      value: 'details',
      context: { error: 'School name is required' },
    });
  });

  it('derives a slug handle when none is given', () => {
    const actor = createSchoolProvisioningActor(undefined, withPorts());
    actor.send({ type: 'SET_DETAILS', name: 'Ananda College Colombo' });
    expect(actor.getSnapshot().context.handle).toBe('ananda-college-colombo');
  });

  it('checks the handle, provisions once with the submission key, and activates', async () => {
    const provision = vi.fn(async () => ({ schoolId: 'sch-9', groupId: 'grp-9' }));
    const actor = submitted(withPorts(async () => true, provision));
    expect(actor.getSnapshot().value).toBe('verifying_handle');
    const done = await waitFor(actor, (s) => s.status === 'done');
    expect(done.context).toMatchObject({
      schoolId: 'sch-9',
      groupId: 'grp-9',
      groupCreationFailed: false,
    });
    expect(provision).toHaveBeenCalledWith({
      name: 'Royal College',
      handle: 'royal-college',
      type: 'secondary',
      idempotencyKey: done.context.idempotencyKey,
    });
    expect(done.context.idempotencyKey).toEqual(expect.any(String));
  });

  it('sends the person back to details when the handle is taken', async () => {
    const actor = submitted(withPorts(async () => false));
    const back = await waitFor(actor, (s) => s.matches('details') && s.context.error !== null);
    expect(back.context.error).toBe('Handle "royal-college" is already claimed. Choose another.');
  });

  it('keeps the school active when only its community group failed', async () => {
    const actor = submitted(
      withPorts(undefined, async () => ({ schoolId: 'sch-1', groupFailed: true })),
    );
    const done = await waitFor(actor, (s) => s.status === 'done');
    expect(done.context).toMatchObject({
      schoolId: 'sch-1',
      groupId: null,
      groupCreationFailed: true,
    });
  });

  it('retries a failed creation with the same key, so the server never makes two schools', async () => {
    const provision = vi
      .fn<(input: ProvisionSchoolInput) => Promise<ProvisionSchoolResult>>()
      .mockRejectedValueOnce(new Error('Gateway timeout'))
      .mockResolvedValue({ schoolId: 'sch-2' });
    const actor = submitted(withPorts(undefined, provision));
    const failed = await waitFor(actor, (s) => s.matches('error'));
    expect(failed.context.error).toBe('Gateway timeout');
    actor.send({ type: 'RETRY' });
    await waitFor(actor, (s) => s.status === 'done');
    const [first, second] = provision.mock.calls.map(([input]) => input.idempotencyKey);
    expect(second).toBe(first);
  });

  it('makes a new key when the form changes after a failure', async () => {
    const actor = submitted(withPorts(undefined, async () => Promise.reject(new Error('down'))));
    const failed = await waitFor(actor, (s) => s.matches('error'));
    const firstKey = failed.context.idempotencyKey;
    actor.send({ type: 'RESET' });
    actor.send({ type: 'SET_DETAILS', name: 'Royal College Colombo' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().context.idempotencyKey).not.toBe(firstKey);
  });

  it('cannot create anything until v1 admits the procedures', async () => {
    const actor = submitted(schoolProvisioningMachine);
    const failed = await waitFor(actor, (s) => s.matches('error'));
    expect(failed.context.error).toBe('school.handleAvailable is not available yet.');
  });

  it('saves and restores provisioning draft using partitioned key standard', async () => {
    const key = resolveSchoolDraftKey({ userId: 'principal-777' });
    expect(key).toBe('sanctuary:global:principal-777:root:school_provisioning_draft');

    const draft = {
      name: 'Vidyalankara Pirivena',
      handle: 'vidyalankara',
      type: 'mixed' as const,
    };

    await saveSchoolDraftSnapshot(key, draft);
    const restored = await restoreSchoolDraftSnapshot(key);
    expect(restored).toEqual(draft);

    await clearSchoolDraftSnapshot(key);
    expect(await restoreSchoolDraftSnapshot(key)).toBeNull();
  });
});
