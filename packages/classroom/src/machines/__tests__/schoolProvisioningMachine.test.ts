import {
  clearSchoolDraftSnapshot,
  createSchoolProvisioningActor,
  executeSchoolProvisioningEffect,
  resolveSchoolDraftKey,
  restoreSchoolDraftSnapshot,
  saveSchoolDraftSnapshot,
  schoolProvisioningMachine,
} from '@repo/classroom/machines/schoolProvisioningMachine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

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

describe('SchoolProvisioningMachine v6 (XState v6 + Effect-TS v4)', () => {
  it('starts in details with clean context', () => {
    const actor = createSchoolProvisioningActor();
    const snapshot = actor.getSnapshot();

    expect(snapshot.value).toBe('details');
    expect(snapshot.context.name).toBe('');
    expect(snapshot.context.handle).toBe('');
    expect(snapshot.context.type).toBe('mixed');
    expect(snapshot.context.error).toBeNull();
  });

  it('rejects empty school name on SUBMIT', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SUBMIT' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('details');
    expect(snapshot.context.error).toBe('School name is required');
  });

  it('auto-derives slug handle when omitted', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SET_DETAILS', name: 'Lotus Wisdom Academy' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.name).toBe('Lotus Wisdom Academy');
    expect(snapshot.context.handle).toBe('lotus-wisdom-academy');
  });

  it('advances to verifying_handle on valid name', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SET_DETAILS', name: 'Sanctuary College' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('verifying_handle');
  });

  it('bounces back to details when handle is already claimed', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SET_DETAILS', name: 'Colombo Central' });
    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('verifying_handle');

    actor.send({ type: 'HANDLE_VERIFIED', available: false });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('details');
    expect(snapshot.context.error).toContain('already claimed');
  });

  it('provisions backend and reaches activated state', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SET_DETAILS', name: 'Ananda Vidyalaya', handle: 'ananda-vid' });
    actor.send({ type: 'SET_TYPE', schoolType: 'secondary' });
    actor.send({ type: 'SUBMIT' });
    actor.send({ type: 'HANDLE_VERIFIED', available: true });

    expect(actor.getSnapshot().value).toBe('provisioning_backend');

    actor.send({
      type: 'PROVISION_SUCCESS',
      schoolId: 'school-ananda-001',
      groupId: 'group-hq-001',
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('activated');
    expect(snapshot.status).toBe('done');
    expect(snapshot.context.schoolId).toBe('school-ananda-001');
    expect(snapshot.context.groupId).toBe('group-hq-001');
    expect(snapshot.context.groupCreationFailed).toBe(false);
  });

  it('tolerates community group creation failure without failing school activation', () => {
    const actor = createSchoolProvisioningActor();
    actor.send({ type: 'SET_DETAILS', name: 'Nalanda College' });
    actor.send({ type: 'SUBMIT' });
    actor.send({ type: 'HANDLE_VERIFIED', available: true });

    actor.send({
      type: 'PROVISION_SUCCESS',
      schoolId: 'school-nalanda-002',
      groupFailed: true,
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('activated');
    expect(snapshot.context.groupCreationFailed).toBe(true);
  });

  it('guards against ghost dispatches in executeSchoolProvisioningEffect', async () => {
    const actor = createSchoolProvisioningActor();
    (actor as any).stop?.();

    const mockDeps = {
      createSchool: vi.fn(),
      createFounderBond: vi.fn(),
    };

    const result = await executeSchoolProvisioningEffect({
      userId: 'founder-101',
      deps: mockDeps,
      actor,
    });

    expect(mockDeps.createSchool).not.toHaveBeenCalled();
    expect(result._tag).toBe('Success');
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
