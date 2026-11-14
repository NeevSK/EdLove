import { describe, expect, it } from 'vitest';
import {
  answerLive,
  createHost,
  createParticipant,
  type HostOutput,
  type HostState,
  hostCommand,
  hostReceive,
  joinMessage,
  participantReceive,
  reconnect,
} from '../live';

const T0 = 1_000_000;

function lobby(): {
  host: HostState;
  ama: ReturnType<typeof createParticipant>;
  kumar: ReturnType<typeof createParticipant>;
} {
  let host = createHost('s1');
  const ama = createParticipant('s1', 'ama');
  const kumar = createParticipant('s1', 'kumar');
  host = hostReceive(host, joinMessage(ama, 'අමා'), T0).state;
  host = hostReceive(host, joinMessage(kumar, 'குமார்'), T0).state;
  return { host, ama, kumar };
}

const last = (o: HostOutput) => o.broadcast.at(-1);

describe('live session', () => {
  it('opens a question, counts answers and reveals the counts', () => {
    const { host: h0, ama: a0, kumar: k0 } = lobby();
    const opened = hostCommand(h0, { kind: 'open', part: 'q1', durationMs: 20_000 }, T0);
    expect(last(opened)).toMatchObject({
      phase: 'question',
      part: 'q1',
      remainingMs: 20_000,
      tally: null,
    });

    // A participant whose clock is 5 minutes off still gets the right deadline.
    const a1 = participantReceive(a0, last(opened), T0 + 300_000).state;
    expect(a1.closesAt).toBe(T0 + 320_000);
    const k1 = participantReceive(k0, last(opened), T0).state;

    const a2 = answerLive(a1, 'ans-a', 'mercury');
    let h = hostReceive(opened.state, a2.send[0], T0 + 1000);
    const amaAck = h.direct[0];
    expect(amaAck).toMatchObject({ to: 'ama', message: { t: 'ack', answerId: 'ans-a' } });
    h = hostReceive(h.state, answerLive(k1, 'ans-k', 'venus').send[0], T0 + 2000);

    const revealed = hostCommand(h.state, { kind: 'reveal' }, T0 + 3000);
    expect(last(revealed)).toMatchObject({ phase: 'revealed', tally: { mercury: 1, venus: 1 } });
    expect(participantReceive(a2.state, amaAck?.message, T0).state.pending.size).toBe(0);
  });

  it('closes a question when its time is up and refuses late answers', () => {
    const { host, kumar } = lobby();
    const opened = hostCommand(host, { kind: 'open', part: 'q1', durationMs: 10_000 }, T0);
    const k = participantReceive(kumar, last(opened), T0).state;
    const closed = hostCommand(opened.state, { kind: 'tick' }, T0 + 10_000);
    expect(closed.state.phase).toBe('revealed');
    const late = hostReceive(closed.state, answerLive(k, 'late', 'venus').send[0], T0 + 11_000);
    expect(late.state.answers.get('q1')?.has('kumar') ?? false).toBe(false);
    expect(late.direct[0]?.message).toMatchObject({ t: 'snapshot', phase: 'revealed' });
  });

  it('keeps an answer sent twice once, and lets a changed answer replace the first', () => {
    const { host, ama } = lobby();
    const opened = hostCommand(host, { kind: 'open', part: 'q1', durationMs: null }, T0);
    const a = participantReceive(ama, last(opened), T0).state;
    const first = answerLive(a, 'x1', 'venus').send[0];
    let h = hostReceive(opened.state, first, T0).state;
    h = hostReceive(h, first, T0).state;
    h = hostReceive(h, answerLive(a, 'x2', 'mercury').send[0], T0).state;
    expect(h.answers.get('q1')?.get('ama')?.response).toBe('mercury');
    expect(hostCommand(h, { kind: 'reveal' }, T0).broadcast[0]).toMatchObject({
      tally: { mercury: 1 },
    });
  });

  it('refuses answers from people who never joined, and messages for another session', () => {
    const { host } = lobby();
    const opened = hostCommand(host, { kind: 'open', part: 'q1', durationMs: null }, T0).state;
    const stranger = {
      t: 'answer',
      v: 1,
      session: 's1',
      who: 'stranger',
      part: 'q1',
      answerId: 'z',
      response: 'a',
    };
    expect(hostReceive(opened, stranger, T0).state.answers.size).toBe(0);
    const other = { t: 'join', v: 1, session: 'other', who: 'x', name: 'x' };
    expect(hostReceive(opened, other, T0).state.participants.has('x')).toBe(false);
    expect(hostReceive(opened, { t: 'answer', v: 1, evil: true }, T0).state).toBe(opened);
  });

  it('ignores stale snapshots and resends unacknowledged answers after a reconnect', () => {
    const { host, ama } = lobby();
    const o1 = hostCommand(host, { kind: 'open', part: 'q1', durationMs: null }, T0);
    const o2 = hostCommand(o1.state, { kind: 'reveal' }, T0);
    let a = participantReceive(ama, last(o2), T0).state;
    a = participantReceive(a, last(o1), T0).state;
    expect(a.phase).toBe('revealed');

    const reopened = hostCommand(o2.state, { kind: 'open', part: 'q2', durationMs: null }, T0);
    a = participantReceive(a, last(reopened), T0).state;
    a = answerLive(a, 'lost', 'true').state;
    const again = reconnect(a).send;
    expect(again.map((m) => m.t)).toEqual(['resync', 'answer']);
  });

  it('counts each choice of a multiple-choice answer', () => {
    const { host, ama, kumar } = lobby();
    const opened = hostCommand(host, { kind: 'open', part: 'q1', durationMs: null }, T0, {
      changeAnswer: true,
      tallyWhileOpen: true,
    });
    const a = participantReceive(ama, last(opened), T0).state;
    const k = participantReceive(kumar, last(opened), T0).state;
    let h = hostReceive(opened.state, answerLive(a, 'm1', ['red', 'blue']).send[0], T0, {
      changeAnswer: true,
      tallyWhileOpen: true,
    });
    expect(h.broadcast[0]).toMatchObject({ tally: { red: 1, blue: 1 } });
    h = hostReceive(h.state, answerLive(k, 'm2', ['blue']).send[0], T0, {
      changeAnswer: true,
      tallyWhileOpen: true,
    });
    expect(h.broadcast[0]).toMatchObject({ tally: { red: 1, blue: 2 } });
  });

  it('keeps every message small enough for a nearby link', () => {
    const { host } = lobby();
    const opened = hostCommand(host, { kind: 'open', part: 'q1', durationMs: 20_000 }, T0);
    expect(new TextEncoder().encode(JSON.stringify(last(opened))).byteLength).toBeLessThan(200);
  });
});
