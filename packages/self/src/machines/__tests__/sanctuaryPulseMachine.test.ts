import {
  createSanctuaryPulseActor,
  sanctuaryPulseMachine,
} from '@repo/self/machines/sanctuaryPulseMachine';
import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';

describe('SanctuaryPulseMachine v6', () => {
  it('initializes in idle state', () => {
    const actor = createActor(sanctuaryPulseMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.cycleCount).toBe(0);
    expect(snapshot.context.totalDurationSeconds).toBe(0);
  });

  it('starts session in inhale phase with cycle 1', () => {
    const actor = createActor(sanctuaryPulseMachine);
    actor.start();

    actor.send({ type: 'START', isPlayfulMode: true });
    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('inhale');
    expect(snapshot.context.cycleCount).toBe(1);
    expect(snapshot.context.isPlayfulMode).toBe(true);
  });

  it('executes a full 4-4-4-4 box breathing cycle', () => {
    const actor = createActor(sanctuaryPulseMachine);
    actor.start();
    actor.send({ type: 'START' });

    expect(actor.getSnapshot().value).toBe('inhale');

    // 1. Inhale -> HoldIn
    actor.send({ type: 'TICK_PHASE' });
    expect(actor.getSnapshot().value).toBe('holdIn');
    expect(actor.getSnapshot().context.totalDurationSeconds).toBe(4);

    // 2. HoldIn -> Exhale
    actor.send({ type: 'TICK_PHASE' });
    expect(actor.getSnapshot().value).toBe('exhale');
    expect(actor.getSnapshot().context.totalDurationSeconds).toBe(8);

    // 3. Exhale -> HoldOut
    actor.send({ type: 'TICK_PHASE' });
    expect(actor.getSnapshot().value).toBe('holdOut');
    expect(actor.getSnapshot().context.totalDurationSeconds).toBe(12);

    // 4. HoldOut -> Next Inhale (Cycle 2)
    actor.send({ type: 'TICK_PHASE' });
    expect(actor.getSnapshot().value).toBe('inhale');
    expect(actor.getSnapshot().context.cycleCount).toBe(2);
    expect(actor.getSnapshot().context.totalDurationSeconds).toBe(16);
  });

  it('interrupts cleanly from any phase to idle', () => {
    const actor = createActor(sanctuaryPulseMachine);
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'TICK_PHASE' }); // in holdIn

    expect(actor.getSnapshot().value).toBe('holdIn');

    actor.send({ type: 'INTERRUPT' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.phase).toBe('idle');
  });

  it('createSanctuaryPulseActor helper boots correctly', () => {
    const actor = createSanctuaryPulseActor(true);
    expect(actor.getSnapshot().value).toBe('inhale');
    expect(actor.getSnapshot().context.isPlayfulMode).toBe(true);
  });
});
