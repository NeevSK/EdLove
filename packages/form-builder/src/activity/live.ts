import { z } from 'zod';

/**
 * A live session: everyone in a class answers the same question at once while the teacher's
 * device sets the pace. Pure and transport-agnostic. The same messages travel over the
 * internet, a school's local network or a nearby (Bluetooth/Wi-Fi Direct) link; a transport
 * only carries them (see `liveTransport.ts`).
 *
 * The host (the teacher's device) holds the only authoritative state. Every host message
 * carries a sequence number, so a participant that misses messages asks for a snapshot.
 * Deadlines are sent as time remaining, never as a clock time, so devices with wrong clocks
 * still agree. Messages are small, because a nearby link carries a few hundred bytes at a time.
 *
 * Answers are also written to each participant's own journal, so if the link drops, the
 * answers still reach the teacher through normal sync later.
 */

export const LIVE_VERSION = 1;

const id = z.string().min(1).max(64);
const response = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(200)).max(20),
]);

const tally = z.record(z.string().max(200), z.number().int().nonnegative());

export const HostMessage = z.discriminatedUnion('t', [
  z.strictObject({
    t: z.literal('snapshot'),
    v: z.literal(LIVE_VERSION),
    session: id,
    seq: z.number().int().nonnegative(),
    phase: z.enum(['lobby', 'question', 'revealed', 'ended']),
    part: id.nullable(),
    remainingMs: z.number().int().nonnegative().nullable(),
    tally: tally.nullable(),
  }),
  z.strictObject({
    t: z.literal('ack'),
    v: z.literal(LIVE_VERSION),
    session: id,
    seq: z.number().int().nonnegative(),
    answerId: id,
  }),
]);
export type HostMessage = z.infer<typeof HostMessage>;

export const ParticipantMessage = z.discriminatedUnion('t', [
  z.strictObject({
    t: z.literal('join'),
    v: z.literal(LIVE_VERSION),
    session: id,
    who: id,
    name: z.string().max(80),
  }),
  z.strictObject({
    t: z.literal('answer'),
    v: z.literal(LIVE_VERSION),
    session: id,
    who: id,
    part: id,
    answerId: id,
    response,
  }),
  z.strictObject({ t: z.literal('resync'), v: z.literal(LIVE_VERSION), session: id, who: id }),
  z.strictObject({ t: z.literal('leave'), v: z.literal(LIVE_VERSION), session: id, who: id }),
]);
export type ParticipantMessage = z.infer<typeof ParticipantMessage>;

export type LiveResponse = z.infer<typeof response>;

// ── Host ──────────────────────────────────────────────────────────────────────────────────

export interface LiveHostPolicy {
  /** A participant may change an answer while the question is open. */
  readonly changeAnswer: boolean;
  /** Send counts while the question is open, not only on reveal. */
  readonly tallyWhileOpen: boolean;
}

export const DEFAULT_LIVE_HOST_POLICY: LiveHostPolicy = {
  changeAnswer: true,
  tallyWhileOpen: false,
};

export interface HostState {
  readonly session: string;
  readonly seq: number;
  readonly phase: 'lobby' | 'question' | 'revealed' | 'ended';
  readonly part: string | null;
  /** Host clock time the open question closes, or null for no limit. */
  readonly closesAt: number | null;
  readonly participants: ReadonlyMap<string, { readonly name: string; readonly present: boolean }>;
  /** part → participant → their latest accepted answer. */
  readonly answers: ReadonlyMap<
    string,
    ReadonlyMap<string, { readonly answerId: string; readonly response: LiveResponse }>
  >;
  readonly seenAnswerIds: ReadonlySet<string>;
}

export type HostCommand =
  | { readonly kind: 'open'; readonly part: string; readonly durationMs: number | null }
  | { readonly kind: 'close' }
  | { readonly kind: 'reveal' }
  | { readonly kind: 'end' }
  | { readonly kind: 'tick' };

export interface HostOutput {
  readonly state: HostState;
  /** Send to every participant. */
  readonly broadcast: readonly HostMessage[];
  /** Send to one participant. */
  readonly direct: readonly { readonly to: string; readonly message: HostMessage }[];
}

export const createHost = (session: string): HostState => ({
  session,
  seq: 0,
  phase: 'lobby',
  part: null,
  closesAt: null,
  participants: new Map(),
  answers: new Map(),
  seenAnswerIds: new Set(),
});

/** Counts per answer for one question. A list answer counts once for each item chosen. */
export function tallyFor(state: HostState, part: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { response: r } of state.answers.get(part)?.values() ?? []) {
    for (const key of Array.isArray(r) ? r : [String(r)]) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function snapshotOf(state: HostState, now: number, policy: LiveHostPolicy): HostMessage {
  const showTally =
    state.part !== null &&
    (state.phase === 'revealed' || (state.phase === 'question' && policy.tallyWhileOpen));
  return {
    t: 'snapshot',
    v: LIVE_VERSION,
    session: state.session,
    seq: state.seq,
    phase: state.phase,
    part: state.part,
    remainingMs:
      state.phase === 'question' && state.closesAt !== null
        ? Math.max(0, state.closesAt - now)
        : null,
    tally: showTally && state.part !== null ? tallyFor(state, state.part) : null,
  };
}

const bump = (state: HostState, changes: Partial<HostState>): HostState => ({
  ...state,
  ...changes,
  seq: state.seq + 1,
});

const out = (
  state: HostState,
  now: number,
  policy: LiveHostPolicy,
  changed: boolean,
): HostOutput => ({
  state,
  broadcast: changed ? [snapshotOf(state, now, policy)] : [],
  direct: [],
});

/** The teacher's actions, and `tick` to close a question when its time runs out. */
export function hostCommand(
  state: HostState,
  command: HostCommand,
  now: number,
  policy: LiveHostPolicy = DEFAULT_LIVE_HOST_POLICY,
): HostOutput {
  if (state.phase === 'ended') return out(state, now, policy, false);
  switch (command.kind) {
    case 'open':
      return out(
        bump(state, {
          phase: 'question',
          part: command.part,
          closesAt: command.durationMs === null ? null : now + command.durationMs,
        }),
        now,
        policy,
        true,
      );
    case 'close':
    case 'reveal':
      if (state.part === null) return out(state, now, policy, false);
      return out(bump(state, { phase: 'revealed', closesAt: null }), now, policy, true);
    case 'end':
      return out(bump(state, { phase: 'ended', closesAt: null }), now, policy, true);
    case 'tick': {
      const expired =
        state.phase === 'question' && state.closesAt !== null && now >= state.closesAt;
      return expired
        ? hostCommand(state, { kind: 'close' }, now, policy)
        : out(state, now, policy, false);
    }
  }
}

/** A message from a participant. Untrusted: it is checked, and answers outside an open question are refused. */
export function hostReceive(
  state: HostState,
  raw: unknown,
  now: number,
  policy: LiveHostPolicy = DEFAULT_LIVE_HOST_POLICY,
): HostOutput {
  const parsed = ParticipantMessage.safeParse(raw);
  if (!parsed.success || parsed.data.session !== state.session)
    return out(state, now, policy, false);
  const message = parsed.data;
  const snapshotTo = (s: HostState, to: string): HostOutput => ({
    state: s,
    broadcast: [],
    direct: [{ to, message: snapshotOf(s, now, policy) }],
  });

  switch (message.t) {
    case 'join': {
      const participants = new Map(state.participants);
      participants.set(message.who, { name: message.name, present: true });
      return snapshotTo({ ...state, participants }, message.who);
    }
    case 'leave': {
      const current = state.participants.get(message.who);
      if (current === undefined) return out(state, now, policy, false);
      const participants = new Map(state.participants);
      participants.set(message.who, { ...current, present: false });
      return out({ ...state, participants }, now, policy, false);
    }
    case 'resync':
      return snapshotTo(state, message.who);
    case 'answer': {
      const ack: HostMessage = {
        t: 'ack',
        v: LIVE_VERSION,
        session: state.session,
        seq: state.seq,
        answerId: message.answerId,
      };
      if (state.seenAnswerIds.has(message.answerId)) {
        return { state, broadcast: [], direct: [{ to: message.who, message: ack }] };
      }
      const open =
        state.phase === 'question' &&
        state.part === message.part &&
        state.participants.has(message.who) &&
        (state.closesAt === null || now < state.closesAt);
      const forPart = state.answers.get(message.part);
      const already = forPart?.has(message.who) ?? false;
      if (!open || (already && !policy.changeAnswer)) return snapshotTo(state, message.who);

      const answers = new Map(state.answers);
      const updated = new Map(forPart ?? []);
      updated.set(message.who, { answerId: message.answerId, response: message.response });
      answers.set(message.part, updated);
      const seenAnswerIds = new Set(state.seenAnswerIds);
      seenAnswerIds.add(message.answerId);
      const next = { ...state, answers, seenAnswerIds };
      return {
        state: next,
        broadcast: policy.tallyWhileOpen ? [snapshotOf(bump(next, {}), now, policy)] : [],
        direct: [{ to: message.who, message: ack }],
      };
    }
  }
}

// ── Participant ───────────────────────────────────────────────────────────────────────────

export interface ParticipantState {
  readonly session: string;
  readonly who: string;
  readonly seq: number;
  readonly phase: 'connecting' | 'lobby' | 'question' | 'revealed' | 'ended';
  readonly part: string | null;
  /** Local clock time the open question closes, from the host's time remaining. */
  readonly closesAt: number | null;
  readonly tally: Record<string, number> | null;
  /** Answers sent and not yet acknowledged, by answerId. Resent after a reconnect. */
  readonly pending: ReadonlyMap<string, ParticipantMessage>;
}

export const createParticipant = (session: string, who: string): ParticipantState => ({
  session,
  who,
  seq: -1,
  phase: 'connecting',
  part: null,
  closesAt: null,
  tally: null,
  pending: new Map(),
});

export interface ParticipantOutput {
  readonly state: ParticipantState;
  readonly send: readonly ParticipantMessage[];
}

/** A message from the host. Older snapshots are ignored; a gap asks for a fresh one. */
export function participantReceive(
  state: ParticipantState,
  raw: unknown,
  now: number,
): ParticipantOutput {
  const parsed = HostMessage.safeParse(raw);
  if (!parsed.success || parsed.data.session !== state.session) return { state, send: [] };
  const message = parsed.data;
  if (message.t === 'ack') {
    const pending = new Map(state.pending);
    pending.delete(message.answerId);
    return { state: { ...state, pending }, send: [] };
  }
  if (message.seq <= state.seq && state.seq !== -1) return { state, send: [] };
  return {
    state: {
      ...state,
      seq: message.seq,
      phase: message.phase,
      part: message.part,
      closesAt: message.remainingMs === null ? null : now + message.remainingMs,
      tally: message.tally,
    },
    send: [],
  };
}

export const joinMessage = (state: ParticipantState, name: string): ParticipantMessage => ({
  t: 'join',
  v: LIVE_VERSION,
  session: state.session,
  who: state.who,
  name,
});

/** Answers the open question. Returns nothing to send when no question is open. */
export function answerLive(
  state: ParticipantState,
  answerId: string,
  value: LiveResponse,
): ParticipantOutput {
  if (state.phase !== 'question' || state.part === null) return { state, send: [] };
  const message: ParticipantMessage = {
    t: 'answer',
    v: LIVE_VERSION,
    session: state.session,
    who: state.who,
    part: state.part,
    answerId,
    response: value,
  };
  const pending = new Map(state.pending);
  pending.set(answerId, message);
  return { state: { ...state, pending }, send: [message] };
}

/** After a reconnect: ask for the current state and resend what wasn't acknowledged. */
export function reconnect(state: ParticipantState): ParticipantOutput {
  return {
    state,
    send: [
      { t: 'resync', v: LIVE_VERSION, session: state.session, who: state.who },
      ...state.pending.values(),
    ],
  };
}
