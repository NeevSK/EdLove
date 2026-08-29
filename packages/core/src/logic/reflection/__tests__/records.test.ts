import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createThoughtRecordStore,
  type ReflectionDb,
  type ThoughtRecordRpcPort,
  thoughtRecordCodec,
} from '../records';
import type { ThoughtRecord } from '../types';

vi.mock('@repo/core/lib/sync', () => ({
  useMutationQueue: {
    getState: () => ({ addToQueue: async () => undefined }),
  },
}));

const baseRecord: ThoughtRecord = {
  id: 'r1',
  userId: 'u1',
  preMood: 2,
  automaticThought: 'I always fail exams',
  emotion: 'anxious',
  intensity: 8,
  trapIds: ['catastrophizing'],
  customTrap: 'my own "the sky is falling" loop',
  evidence: { forThought: 'one bad mark', againstThought: 'I passed last term' },
  reframedThought: 'One result does not define me',
  postMood: 4,
  postOutcome: 'better',
  followUp: { dueAt: '2026-09-01T00:00:00.000Z' },
  createdAt: '2026-08-27T10:00:00.000Z',
  completedAt: '2026-08-27T10:15:00.000Z',
};

const WIRE = {
  id: 'r1',
  user_id: 'u1',
  thought: 'I always fail exams',
  situation: null,
  emotion: { label: 'anxious', intensity: 8 },
  trap_ids: [
    { id: 'catastrophizing', label: 'Catastrophizing' },
    { id: '#custom', label: 'my own "the sky is falling" loop' },
  ],
  evidence_for: 'one bad mark',
  evidence_against: 'I passed last term',
  reframe: 'One result does not define me',
  mood_before: 2,
  mood_after: 4,
  post_outcome: 'better',
  follow_up: { due_at: '2026-09-01T00:00:00.000Z' },
  idempotency_key: null,
  created_at: new Date('2026-08-27T10:00:00.000Z'),
};

describe('thoughtRecordCodec', () => {
  it('round-trips domain → wire → domain', () => {
    const wire = thoughtRecordCodec.domainToWire(baseRecord);
    expect(wire).toEqual({
      thought: 'I always fail exams',
      situation: null,
      emotion: { label: 'anxious', intensity: 8 },
      trap_ids: [
        { id: 'catastrophizing' },
        { id: '#custom', label: 'my own "the sky is falling" loop' },
      ],
      evidence_for: 'one bad mark',
      evidence_against: 'I passed last term',
      reframe: 'One result does not define me',
      mood_before: 2,
      mood_after: 4,
      post_outcome: 'better',
      follow_up: { due_at: '2026-09-01T00:00:00.000Z' },
    });

    const restored = thoughtRecordCodec.wireToDomain(WIRE);
    expect(restored.automaticThought).toBe('I always fail exams');
    expect(restored.customTrap).toBe('my own "the sky is falling" loop');
    expect(restored.trapIds).toEqual(['catastrophizing']);
    expect(restored.postOutcome).toBe('better');
    expect(restored.followUp?.dueAt).toBe('2026-09-01T00:00:00.000Z');
  });

  it('normalizes out-of-range moods on the way in from a row', () => {
    const row = thoughtRecordCodec.domainToRow(baseRecord);
    const excessive: typeof row = {
      ...row,
      moodBefore: 9,
      moodAfter: 0,
      postOutcome: null,
    };
    const domain = thoughtRecordCodec.rowToDomain(excessive);
    expect(domain.preMood).toBe(5);
    expect(domain.postMood).toBe(1);
    expect(domain.postOutcome).toBe('worse');
  });

  it('serializes the follow-up JSON for the row only when present', () => {
    const row = thoughtRecordCodec.domainToRow(baseRecord);
    expect(row.followUp).toContain('"due_at":"2026-09-01T00:00:00.000Z"');

    const without = thoughtRecordCodec.domainToRow({ ...baseRecord, followUp: undefined });
    expect(without.followUp).toBeNull();
  });
});

function makeFakeDb(overrides: Partial<ReflectionDb> = {}): ReflectionDb {
  return {
    insertRow: vi.fn(async () => undefined),
    listByUserId: vi.fn(async () => []),
    getFollowUpById: vi.fn(async () => undefined),
    markFollowUp: vi.fn(async () => undefined),
    ...overrides,
  };
}

function makeFakeRpc(overrides = {}): ThoughtRecordRpcPort {
  return {
    saveThoughtRecord: vi.fn(async (input) => ({ ...WIRE, ...input })),
    getThoughtRecords: vi.fn(async () => []),
    completeThoughtRecordFollowUp: vi.fn(async () => WIRE),
    ...overrides,
  } as unknown as ThoughtRecordRpcPort;
}

describe('createThoughtRecordStore', () => {
  let db: ReflectionDb;
  let rpc: ThoughtRecordRpcPort;

  beforeEach(() => {
    db = makeFakeDb();
    rpc = makeFakeRpc();
  });

  it('writes locally and returns the record on the happy path', async () => {
    const store = createThoughtRecordStore({ rpc, db: () => db });
    const result = await store.createThoughtRecord('u1', baseRecord);
    expect(result).toBe(baseRecord);
    expect(db.insertRow).toHaveBeenCalledTimes(1);
    expect(rpc.saveThoughtRecord).not.toHaveBeenCalled();
  });

  it('falls back to RPC when the local insert throws', async () => {
    const failing = makeFakeDb({
      insertRow: vi.fn(async () => {
        throw new Error('no sqlite');
      }),
    });
    const store = createThoughtRecordStore({ rpc, db: () => failing });
    const result = await store.createThoughtRecord('u1', baseRecord);
    expect(result.id).toBe('r1');
    expect(rpc.saveThoughtRecord).toHaveBeenCalledTimes(1);
  });

  it('goes straight to RPC when not local-first', async () => {
    const store = createThoughtRecordStore({
      rpc,
      db: () => db,
      isLocalFirstAvailable: () => false,
    });
    await store.createThoughtRecord('u1', baseRecord);
    expect(db.insertRow).not.toHaveBeenCalled();
    expect(rpc.saveThoughtRecord).toHaveBeenCalledTimes(1);
  });

  it('reads local records first and falls back to RPC on failure', async () => {
    const row = thoughtRecordCodec.domainToRow(baseRecord);
    const localDb = makeFakeDb({
      listByUserId: vi.fn(async () => [row]),
    });
    const local = createThoughtRecordStore({ rpc, db: () => localDb });
    const records = await local.fetchThoughtRecordsForView('u1', { phase: 'day' });
    expect(records).toHaveLength(1);
    expect(rpc.getThoughtRecords).not.toHaveBeenCalled();

    const failing = makeFakeDb({
      listByUserId: vi.fn(async () => {
        throw new Error('no sqlite');
      }),
    });
    const remote = createThoughtRecordStore({ rpc, db: () => failing });
    await remote.fetchThoughtRecordsForView('u1', { phase: 'day' });
    expect(rpc.getThoughtRecords).toHaveBeenCalledTimes(1);
  });

  it('completes a follow-up locally and falls back to RPC', async () => {
    const local = createThoughtRecordStore({ rpc, db: () => db });
    await local.completeThoughtRecordFollowUp('r1', {
      outcome: 'better',
      reflection: 'felt lighter',
    });
    expect(db.markFollowUp).toHaveBeenCalledTimes(1);
    expect(rpc.completeThoughtRecordFollowUp).not.toHaveBeenCalled();

    const firing = makeFakeDb({
      getFollowUpById: vi.fn(async () => {
        throw new Error('no sqlite');
      }),
    });
    const remote = createThoughtRecordStore({ rpc, db: () => firing });
    await remote.completeThoughtRecordFollowUp('r1', { outcome: 'better' });
    expect(rpc.completeThoughtRecordFollowUp).toHaveBeenCalledTimes(1);
  });
});
