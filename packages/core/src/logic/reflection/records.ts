/**
 * Local-first persistence for the guided-reflection engine.
 *
 * Shared store used by @repo/self (Reframe → thought_records) and
 * @repo/classroom (Learning Reflection → learning_reflections). Each feature
 * injects its own RPC port, its own table, and its own codec; the local-first
 * orchestration (SQLite → outbox → RPC fallback) and the wire mapping live
 * here once. Mirror of the `mood_logs` pattern.
 */
import { thoughtRecords } from '@repo/core/adapters/powersync/schema';
import type { ThoughtRecord as WireThoughtRecord } from '@repo/core/logic/schemas/self.schema';
import { desc, eq } from 'drizzle-orm';
import { deriveReframeOutcome } from './reframe';
import type { ReframeFollowUp, ReframeOutcome, ThoughtEmotion, ThoughtRecord } from './types';

const CUSTOM_TRAP_ID = '#custom';

/** The shared row shape of both reflection tables. */
export interface ReflectionRow {
  id: string;
  userId: string;
  thought: string;
  situation: string | null;
  emotion: string | null;
  trapIds: string | null;
  evidenceFor: string | null;
  evidenceAgainst: string | null;
  reframe: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  postOutcome: string | null;
  followUp: string | null;
  createdAt: string;
  [key: string]: unknown;
}

/** ReflectionRow plus feature-owned extra columns (e.g. classroom_id). */
export type ReflectionRowWithExtras = ReflectionRow & Record<string, unknown>;

interface WireEmotion {
  label?: ThoughtEmotion;
  intensity?: number;
}

interface WireTrapEntry {
  id: string;
  label?: string;
}

interface WireFollowUp {
  due_at: string;
  completed_at?: string;
  outcome?: ReframeOutcome;
  reflection?: string;
}

/** The JSON type the wire schema stores under `follow_up`. */
type WireJsonValue = NonNullable<WireThoughtRecord['follow_up']>;
type WireJsonObject = { [key: string]: WireJsonValue };

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeMood(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  if (value < 1) return 1;
  if (value > 5) return 5;
  return Math.round(value);
}

function toWireFollowUp(followUp: ReframeFollowUp | undefined): WireJsonValue | null {
  if (!followUp) return null;
  const json: WireJsonObject = { due_at: followUp.dueAt };
  if (followUp.completedAt) json.completed_at = followUp.completedAt;
  if (followUp.outcome) json.outcome = followUp.outcome;
  if (followUp.reflection) json.reflection = followUp.reflection;
  return json;
}

function fromWireFollowUp(followUp: WireFollowUp | null | undefined): ReframeFollowUp | undefined {
  if (!followUp) return undefined;
  return {
    dueAt: followUp.due_at,
    completedAt: followUp.completed_at,
    outcome: followUp.outcome,
    reflection: followUp.reflection,
  };
}

function toTrapEntries(record: ThoughtRecord): WireJsonValue[] {
  const entries: WireJsonValue[] = record.trapIds.map((id) => ({ id }));
  if (record.customTrap) {
    entries.push({ id: CUSTOM_TRAP_ID, label: record.customTrap });
  }
  return entries;
}

function fromTrapEntries(entries: WireTrapEntry[] | null): {
  trapIds: string[];
  customTrap?: string;
} {
  return {
    trapIds: (entries ?? []).filter((e) => e.id !== CUSTOM_TRAP_ID).map((e) => e.id),
    customTrap: (entries ?? []).find((e) => e.id === CUSTOM_TRAP_ID)?.label,
  };
}

function toDomainFromRow(row: ReflectionRow): ThoughtRecord {
  const emotion = parseJson<WireEmotion>(row.emotion);
  const trapIds = fromTrapEntries(parseJson<WireTrapEntry[]>(row.trapIds));
  const preMood = normalizeMood(row.moodBefore, 3);
  const postMood = normalizeMood(row.moodAfter, preMood);
  return {
    id: row.id,
    userId: row.userId,
    preMood,
    preNote: row.situation ?? undefined,
    automaticThought: row.thought,
    emotion: emotion?.label ?? 'calm',
    intensity: emotion?.intensity ?? 5,
    trapIds: trapIds.trapIds,
    customTrap: trapIds.customTrap,
    evidence: {
      forThought: row.evidenceFor ?? '',
      againstThought: row.evidenceAgainst ?? '',
    },
    reframedThought: row.reframe ?? '',
    postMood,
    postOutcome:
      (row.postOutcome as ReframeOutcome | null | undefined) ??
      deriveReframeOutcome(preMood, postMood),
    followUp: fromWireFollowUp(parseJson<WireFollowUp>(row.followUp)),
    createdAt: row.createdAt,
    completedAt: row.createdAt,
  };
}

function toDomainFromWire(wire: WireThoughtRecord): ThoughtRecord {
  const emotion = (wire.emotion as WireEmotion | null) ?? null;
  const trapIds = fromTrapEntries((wire.trap_ids as WireTrapEntry[] | null) ?? null);
  const preMood = normalizeMood(wire.mood_before, 3);
  const postMood = normalizeMood(wire.mood_after, preMood);
  return {
    id: wire.id,
    userId: wire.user_id,
    preMood,
    preNote: wire.situation ?? undefined,
    automaticThought: wire.thought,
    emotion: emotion?.label ?? 'calm',
    intensity: emotion?.intensity ?? 5,
    trapIds: trapIds.trapIds,
    customTrap: trapIds.customTrap,
    evidence: {
      forThought: wire.evidence_for ?? '',
      againstThought: wire.evidence_against ?? '',
    },
    reframedThought: wire.reframe ?? '',
    postMood,
    postOutcome:
      (wire.post_outcome as ReframeOutcome | null | undefined) ??
      deriveReframeOutcome(preMood, postMood),
    followUp: fromWireFollowUp((wire.follow_up as WireFollowUp | null) ?? undefined),
    createdAt: new Date(wire.created_at).toISOString(),
    completedAt: new Date(wire.created_at).toISOString(),
  };
}

/** The RPC save payload a client submits (no ids/timestamps). */
export type ReflectionWirePayload = Omit<WireThoughtRecord, 'id' | 'created_at' | 'user_id'>;

function toWirePayload(record: ThoughtRecord): ReflectionWirePayload {
  const followUp = toWireFollowUp(record.followUp);
  return {
    thought: record.automaticThought,
    situation: record.preNote ?? null,
    emotion: { label: record.emotion, intensity: record.intensity },
    trap_ids: toTrapEntries(record),
    evidence_for: record.evidence.forThought,
    evidence_against: record.evidence.againstThought,
    reframe: record.reframedThought,
    mood_before: record.preMood,
    mood_after: record.postMood,
    post_outcome: record.postOutcome,
    follow_up: followUp,
  };
}

/**
 * RPC port the store falls back to when the local store is unavailable.
 * Core defines the seam; each feature injects its own client (selfAPI for
 * thought records, classroom's client for learning reflections).
 */
export interface ThoughtRecordRpcPort<TWire extends WireThoughtRecord = WireThoughtRecord> {
  saveThoughtRecord(input: Omit<TWire, 'id' | 'created_at' | 'user_id'>): Promise<TWire>;
  getThoughtRecords(userId: string, limit?: number, viewDate?: string): Promise<TWire[]>;
  completeThoughtRecordFollowUp(
    id: string,
    input: { post_outcome?: TWire['post_outcome']; follow_up?: TWire['follow_up'] },
  ): Promise<TWire>;
}

/**
 * Feature-owned mapping between the domain record and the local row + wire
 * payload. The default maps plain ThoughtRecords; classroom extends it to
 * carry classroom/assignment context through both shapes.
 */
export interface ReflectionRecordCodec<
  TRecord extends ThoughtRecord = ThoughtRecord,
  TWire extends WireThoughtRecord = WireThoughtRecord,
> {
  rowToDomain(row: ReflectionRow): TRecord;
  wireToDomain(wire: TWire): TRecord;
  domainToRow(record: TRecord): ReflectionRowWithExtras;
  domainToWire(record: TRecord): Omit<TWire, 'id' | 'created_at' | 'user_id'>;
}

/** Narrow table slice the store needs; injectable for tests. */
export interface ReflectionDb {
  insertRow(row: ReflectionRowWithExtras): Promise<void>;
  listByUserId(userId: string, limit: number): Promise<ReflectionRow[]>;
  getFollowUpById(id: string): Promise<{ followUp: string | null } | undefined>;
  markFollowUp(id: string, followUp: string, postOutcome: ReframeOutcome): Promise<void>;
}

/**
 * SQLite adapter for a reflection table. `learningReflections` and
 * `thoughtRecords` share every column used here, so one implementation serves
 * both tables (the drizzle table types are structurally compatible).
 */
export function createDrizzleReflectionDb(table: typeof thoughtRecords): ReflectionDb {
  return {
    async insertRow(row: ReflectionRowWithExtras) {
      const { getDrizzleDB } = await import('@repo/core/powersync');
      await getDrizzleDB()
        .insert(table)
        .values(row as never);
    },
    async listByUserId(userId, limit) {
      const { getDrizzleDB } = await import('@repo/core/powersync');
      const rows = await getDrizzleDB()
        .select()
        .from(table)
        .where(eq(table.userId, userId))
        .orderBy(desc(table.createdAt))
        .limit(limit);
      return rows as unknown as ReflectionRow[];
    },
    async getFollowUpById(id) {
      const { getDrizzleDB } = await import('@repo/core/powersync');
      const rows = await getDrizzleDB().select().from(table).where(eq(table.id, id)).limit(1);
      const first = rows[0];
      return first ? { followUp: first.followUp } : undefined;
    },
    async markFollowUp(id, followUp, postOutcome) {
      const { getDrizzleDB } = await import('@repo/core/powersync');
      await getDrizzleDB().update(table).set({ followUp, postOutcome }).where(eq(table.id, id));
    },
  };
}

/** The default codec: plain ThoughtRecord ↔ the shared wire/row shape. */
export const thoughtRecordCodec: ReflectionRecordCodec = {
  rowToDomain: (row) => toDomainFromRow(row),
  wireToDomain: (wire) => toDomainFromWire(wire),
  domainToRow: (record) => {
    const followUp = toWireFollowUp(record.followUp);
    return {
      id: record.id,
      userId: record.userId,
      thought: record.automaticThought,
      situation: record.preNote ?? null,
      emotion: JSON.stringify({ label: record.emotion, intensity: record.intensity }),
      trapIds: JSON.stringify(toTrapEntries(record)),
      evidenceFor: record.evidence.forThought,
      evidenceAgainst: record.evidence.againstThought,
      reframe: record.reframedThought,
      moodBefore: record.preMood,
      moodAfter: record.postMood,
      postOutcome: record.postOutcome,
      followUp: followUp ? JSON.stringify(followUp) : null,
      createdAt: record.createdAt,
    };
  },
  domainToWire: (record) => toWirePayload(record),
};

export interface ThoughtRecordStoreDeps<
  TRecord extends ThoughtRecord = ThoughtRecord,
  TWire extends WireThoughtRecord = WireThoughtRecord,
> {
  rpc: ThoughtRecordRpcPort<TWire>;
  codec?: ReflectionRecordCodec<TRecord, TWire>;
  db?: () => ReflectionDb;
  outbox?: { saveName?: string; completeName?: string; scope?: string };
  isLocalFirstAvailable?: () => boolean;
}

export interface ThoughtRecordStore<TRecord extends ThoughtRecord = ThoughtRecord> {
  createThoughtRecord(userId: string, record: TRecord): Promise<TRecord>;
  fetchThoughtRecordsForView(userId: string, _options: { phase: string }): Promise<TRecord[]>;
  completeThoughtRecordFollowUp(
    id: string,
    input: { outcome: ReframeOutcome; reflection?: string },
  ): Promise<void>;
}

/**
 * Local-first store: SQLite write + outbox enqueue on native, RPC fallback on
 * web or any failure. Behavior mirrors the `mood_logs` path.
 */
export function createThoughtRecordStore<
  TRecord extends ThoughtRecord = ThoughtRecord,
  TWire extends WireThoughtRecord = WireThoughtRecord,
>(deps: ThoughtRecordStoreDeps<TRecord, TWire>): ThoughtRecordStore<TRecord> {
  const codec: ReflectionRecordCodec<TRecord, TWire> =
    deps.codec ?? (thoughtRecordCodec as ReflectionRecordCodec<TRecord, TWire>);
  const db = deps.db ?? (() => createDrizzleReflectionDb(thoughtRecords));
  const isLocalFirstAvailable = deps.isLocalFirstAvailable ?? (() => true);
  const saveName = deps.outbox?.saveName ?? 'saveThoughtRecord';
  const completeName = deps.outbox?.completeName ?? 'completeThoughtRecordFollowUp';
  const outboxScope = deps.outbox?.scope ?? 'wellbeing';

  const enqueueOutbox = async (name: string, variables: unknown) => {
    const { useMutationQueue } = await import('../../lib/sync');
    await useMutationQueue.getState().addToQueue({
      name,
      scope: outboxScope,
      variables,
      type: 'CUSTOM' as const,
    });
  };

  return {
    async createThoughtRecord(userId, record) {
      if (isLocalFirstAvailable()) {
        try {
          await db().insertRow(codec.domainToRow(record));
          await enqueueOutbox(saveName, codec.domainToWire(record));
          return record;
        } catch (err) {
          console.warn(
            '[ReflectionStore] Local SQLite insert failed. Falling back to RPC API.',
            err,
          );
        }
      }

      const wire = await deps.rpc.saveThoughtRecord(codec.domainToWire(record));
      return codec.wireToDomain(wire);
    },

    async fetchThoughtRecordsForView(userId, _options) {
      if (isLocalFirstAvailable()) {
        try {
          const rows = await db().listByUserId(userId, 30);
          return rows.map((row) => codec.rowToDomain(row));
        } catch (err) {
          console.warn(
            '[ReflectionStore] Local reflection fetch failed. Falling back to RPC API.',
            err,
          );
        }
      }

      const wires = await deps.rpc.getThoughtRecords(userId, 30);
      return wires.map((wire) => codec.wireToDomain(wire));
    },

    async completeThoughtRecordFollowUp(id, input) {
      const completedAt = new Date().toISOString();

      const buildFollowUp = (dueAt: string): WireJsonValue => {
        const json: WireJsonObject = { due_at: dueAt, completed_at: completedAt };
        if (input.outcome) json.outcome = input.outcome;
        if (input.reflection) json.reflection = input.reflection;
        return json;
      };

      if (isLocalFirstAvailable()) {
        try {
          const existing = await db().getFollowUpById(id);
          const existingFollowUp =
            existing?.followUp !== null && existing?.followUp !== undefined
              ? parseJson<WireFollowUp>(existing.followUp)
              : null;
          const dueAt = existingFollowUp?.due_at ?? new Date().toISOString();
          const updated = buildFollowUp(dueAt);

          await db().markFollowUp(id, JSON.stringify(updated), input.outcome);
          await enqueueOutbox(completeName, {
            id,
            post_outcome: input.outcome,
            follow_up: updated,
          });
          return;
        } catch (err) {
          console.warn(
            '[ReflectionStore] Local follow-up update failed. Falling back to RPC API.',
            err,
          );
        }
      }

      await deps.rpc.completeThoughtRecordFollowUp(id, {
        post_outcome: input.outcome,
        follow_up: buildFollowUp(new Date().toISOString()),
      });
    },
  };
}
