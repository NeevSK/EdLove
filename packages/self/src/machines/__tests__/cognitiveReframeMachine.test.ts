import {
  cognitiveReframeMachine,
  createCognitiveReframeActor,
  executeSaveThoughtRecordEffect,
  restoreReframeDraftSnapshot,
  saveReframeDraftSnapshot,
} from '@repo/self/machines/cognitiveReframeMachine';
import type { ThoughtRecord } from '@repo/self/types';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('cognitiveReframeMachine (XState v6 + Effect v4)', () => {
  it('initializes in checkup state with default context values', () => {
    const actor = createActor(cognitiveReframeMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('checkup');
    expect(snapshot.context.preMood).toBe(3);
    expect(snapshot.context.emotion).toBe('anxious');
    expect(snapshot.context.intensity).toBe(6);
    expect(snapshot.context.trapIds).toEqual([]);
    expect(snapshot.context.error).toBeNull();
  });

  it('navigates through the 7 steps when valid inputs are provided', () => {
    const actor = createActor(cognitiveReframeMachine);
    actor.start();

    // 1. checkup
    actor.send({ type: 'SET_PRE_MOOD', mood: 2 });
    actor.send({ type: 'SET_PRE_NOTE', note: 'Feeling stressed before presentation' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('thought');

    // 2. thought
    actor.send({ type: 'SET_AUTOMATIC_THOUGHT', text: 'I am going to fail completely' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('feeling');

    // 3. feeling
    actor.send({ type: 'SET_EMOTION', emotion: 'overwhelmed' });
    actor.send({ type: 'SET_INTENSITY', intensity: 8 });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('traps');

    // 4. traps
    actor.send({ type: 'TOGGLE_TRAP', trapId: 'catastrophizing' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('evidence');

    // 5. evidence
    actor.send({ type: 'SET_FOR_THOUGHT', text: 'I stumbled on one slide during rehearsal' });
    actor.send({
      type: 'SET_AGAINST_THOUGHT',
      text: 'I know the subject well and practiced 5 times',
    });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('reframe');

    // 6. reframe
    actor.send({
      type: 'SET_REFRAMED_THOUGHT',
      text: 'Stumbling is normal; I am prepared and will do fine',
    });
    actor.send({ type: 'SET_POST_MOOD', mood: 4 });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('recheck');

    // 7. recheck
    expect(actor.getSnapshot().context.preMood).toBe(2);
    expect(actor.getSnapshot().context.postMood).toBe(4);
    expect(actor.getSnapshot().context.emotion).toBe('overwhelmed');
  });

  it('enforces validation guards on required steps', () => {
    const actor = createActor(cognitiveReframeMachine);
    actor.start();

    // From checkup to thought
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('thought');

    // Attempt advance without thought
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('thought');
    expect(actor.getSnapshot().context.error).toBeTruthy();

    // Fill thought and proceed
    actor.send({ type: 'SET_AUTOMATIC_THOUGHT', text: 'Nobody likes me' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('feeling');

    // Proceed to traps
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('traps');

    // Attempt advance without selecting any trap
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('traps');
    expect(actor.getSnapshot().context.error).toBeTruthy();

    // Toggle trap and advance
    actor.send({ type: 'TOGGLE_TRAP', trapId: 'all_or_nothing' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('evidence');

    // Attempt advance without evidence
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('evidence');
    expect(actor.getSnapshot().context.error).toBeTruthy();
  });

  it('supports backwards navigation via PREV', () => {
    const actor = createActor(cognitiveReframeMachine);
    actor.start();

    actor.send({ type: 'NEXT' }); // to thought
    expect(actor.getSnapshot().value).toBe('thought');

    actor.send({ type: 'PREV' }); // back to checkup
    expect(actor.getSnapshot().value).toBe('checkup');
  });

  it('supports JUMP_TO_STEP navigation', () => {
    const actor = createActor(cognitiveReframeMachine);
    actor.start();

    actor.send({ type: 'JUMP_TO_STEP', step: 'evidence' });
    expect(actor.getSnapshot().value).toBe('evidence');
  });

  it('handles draft snapshot saving and restoration', () => {
    const actor1 = createCognitiveReframeActor({ userId: 'usr-42' });
    actor1.send({ type: 'SET_AUTOMATIC_THOUGHT', text: 'Test thought' });
    actor1.send({ type: 'JUMP_TO_STEP', step: 'feeling' });

    saveReframeDraftSnapshot(actor1, 'usr-42');

    const actor2 = createCognitiveReframeActor({ userId: 'usr-42' });
    const restored = restoreReframeDraftSnapshot(actor2, 'usr-42');

    expect(restored).toBe(true);
    expect(actor2.getSnapshot().context.automaticThought).toBe('Test thought');
    expect(actor2.getSnapshot().value).toBe('feeling');
  });

  it('executes executeSaveThoughtRecordEffect via Effect-TS v4 successfully', async () => {
    const actor = createCognitiveReframeActor({
      userId: 'usr-42',
      preMood: 1,
      automaticThought: 'I cannot handle this',
      emotion: 'anxious',
      intensity: 9,
      trapIds: ['catastrophizing'],
      forThought: 'It feels big',
      againstThought: 'I have handled big things before',
      reframedThought: 'I will take it one breath at a time',
      postMood: 4,
      scheduledHours: 48,
    });

    actor.send({ type: 'JUMP_TO_STEP', step: 'recheck' });

    const mockSaved: ThoughtRecord = {
      id: 'saved-rec-1',
      userId: 'usr-42',
      preMood: 1,
      automaticThought: 'I cannot handle this',
      emotion: 'anxious',
      intensity: 9,
      trapIds: ['catastrophizing'],
      evidence: { forThought: 'It feels big', againstThought: 'I have handled big things before' },
      reframedThought: 'I will take it one breath at a time',
      postMood: 4,
      postOutcome: 'better',
      createdAt: '2026-10-26T00:00:00Z',
      completedAt: '2026-10-26T00:05:00Z',
    };

    const addFn = vi.fn().mockResolvedValue(mockSaved);
    const purgeFn = vi.fn();

    const result = await executeSaveThoughtRecordEffect(actor, addFn, purgeFn);

    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('completed');
    expect(actor.getSnapshot().context.savedRecord).toEqual(mockSaved);
    expect(purgeFn).toHaveBeenCalled();
  });

  it('handles save failure with error state in executeSaveThoughtRecordEffect', async () => {
    const actor = createCognitiveReframeActor({
      userId: 'usr-42',
      preMood: 2,
      automaticThought: 'Something will go wrong',
      reframedThought: 'It might be fine',
      postMood: 3,
    });

    actor.send({ type: 'JUMP_TO_STEP', step: 'recheck' });

    const addFn = vi.fn().mockRejectedValue(new Error('Network offline'));
    const result = await executeSaveThoughtRecordEffect(actor, addFn);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network offline');
    expect(actor.getSnapshot().value).toBe('recheck');
    expect(actor.getSnapshot().context.error).toBe('Network offline');
  });
});
