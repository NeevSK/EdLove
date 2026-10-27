import {
  createWindDownRitualActor,
  executeSaveWindDownRitualEffect,
  windDownRitualMachine,
} from '@repo/self/machines/windDownRitualMachine';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('windDownRitualMachine (XState v6 + Effect v4)', () => {
  it('initializes in breathe step with empty context', () => {
    const actor = createActor(windDownRitualMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('breathe');
    expect(actor.getSnapshot().context.wentWell).toBe('');
    expect(actor.getSnapshot().context.toRelease).toBe('');
    expect(actor.getSnapshot().context.tomorrowIntent).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('navigates through all steps when valid input is provided', () => {
    const actor = createActor(windDownRitualMachine);
    actor.start();

    // 1. breathe -> NEXT
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('reflect');

    // 2. reflect -> NEXT (blocked when empty)
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('reflect');
    expect(actor.getSnapshot().context.error).toBeTruthy();

    // 2. reflect -> provide text -> NEXT
    actor.send({ type: 'SET_WENT_WELL', text: 'Completed our project deployment' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('release');

    // 3. release -> NEXT (blocked when empty)
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('release');
    expect(actor.getSnapshot().context.error).toBeTruthy();

    // 3. release -> provide text -> NEXT
    actor.send({ type: 'SET_TO_RELEASE', text: 'Letting go of small timeline worries' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('intent');

    // 4. intent -> provide text -> NEXT
    actor.send({ type: 'SET_TOMORROW_INTENT', text: 'Listen with calm patience' });
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('saving');
  });

  it('supports backwards navigation via PREV', () => {
    const actor = createActor(windDownRitualMachine);
    actor.start();

    actor.send({ type: 'NEXT' }); // to reflect
    expect(actor.getSnapshot().value).toBe('reflect');

    actor.send({ type: 'PREV' }); // back to breathe
    expect(actor.getSnapshot().value).toBe('breathe');
  });

  it('executes executeSaveWindDownRitualEffect successfully', async () => {
    const actor = createWindDownRitualActor({
      userId: 'usr-100',
      wentWell: 'Read a wonderful book chapter',
      toRelease: 'Frustration over bad traffic',
      tomorrowIntent: 'Start early with gratitude',
    });

    actor.send({ type: 'SET_WENT_WELL', text: 'Read a wonderful book chapter' });
    actor.send({ type: 'SET_TO_RELEASE', text: 'Frustration over bad traffic' });
    actor.send({ type: 'SET_TOMORROW_INTENT', text: 'Start early with gratitude' });

    const mockSave = vi.fn().mockResolvedValue(undefined);

    const result = await executeSaveWindDownRitualEffect(actor, mockSave);

    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('completed');
    expect(mockSave).toHaveBeenCalledWith('usr-100', {
      went_well: 'Read a wonderful book chapter',
      to_release: 'Frustration over bad traffic',
      tomorrow_intent: 'Start early with gratitude',
    });
  });

  it('handles save error in executeSaveWindDownRitualEffect', async () => {
    const actor = createWindDownRitualActor({
      userId: 'usr-100',
      wentWell: 'Work was good',
      toRelease: 'Stress',
      tomorrowIntent: 'Peace',
    });

    const mockSave = vi.fn().mockRejectedValue(new Error('Database unavailable'));

    const result = await executeSaveWindDownRitualEffect(actor, mockSave);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database unavailable');
    expect(actor.getSnapshot().value).toBe('intent');
    expect(actor.getSnapshot().context.error).toBe('Database unavailable');
  });
});
