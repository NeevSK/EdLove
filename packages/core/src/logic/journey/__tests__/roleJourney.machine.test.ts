import { createRoleJourneyActor, roleJourneyMachine } from '@repo/core/logic/journey/roleJourney.machine';
import { getJourneySnapshotStorageKey, loadJourneySnapshot, saveJourneySnapshot } from '@repo/core/adapters/storage/journeySnapshot.adapter';
import { storage } from '@repo/core/lib/storage.adapter';
import { beforeEach, describe, expect, it } from 'vitest';
import { createActor } from 'xstate';

describe('RoleJourneyMachine v6', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('starts in day0_onboarding state with initial context', () => {
    const actor = createActor(roleJourneyMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('day0_onboarding');
    expect(snapshot.context.currentStepIndex).toBe(0);
    expect(snapshot.context.completedStepIds).toEqual([]);
  });

  it('advances steps sequentially in day0_onboarding', () => {
    const actor = createActor(roleJourneyMachine);
    actor.start();

    actor.send({ type: 'ADVANCE_STEP', stepId: 'welcome_seen' });
    expect(actor.getSnapshot().value).toBe('day0_onboarding');
    expect(actor.getSnapshot().context.currentStepIndex).toBe(1);
    expect(actor.getSnapshot().context.completedStepIds).toContain('welcome_seen');

    actor.send({ type: 'ADVANCE_STEP', stepId: 'first_profile_setup' });
    expect(actor.getSnapshot().context.currentStepIndex).toBe(2);
    expect(actor.getSnapshot().context.completedStepIds).toEqual([
      'welcome_seen',
      'first_profile_setup',
    ]);
  });

  it('transitions to day1_operational on COMPLETE_MILESTONE', () => {
    const actor = createActor(roleJourneyMachine);
    actor.start();

    actor.send({ type: 'COMPLETE_MILESTONE', stepId: 'first_school_created' });
    expect(actor.getSnapshot().value).toBe('day1_operational');
    expect(actor.getSnapshot().context.completedStepIds).toContain('first_school_created');
  });

  it('transitions to day1_operational on DISMISS_SCAFFOLD', () => {
    const actor = createActor(roleJourneyMachine);
    actor.start();

    actor.send({ type: 'DISMISS_SCAFFOLD' });
    expect(actor.getSnapshot().value).toBe('day1_operational');
  });

  it('resets back to day0_onboarding on RESET_JOURNEY', () => {
    const actor = createActor(roleJourneyMachine);
    actor.start();

    actor.send({ type: 'DISMISS_SCAFFOLD' });
    expect(actor.getSnapshot().value).toBe('day1_operational');

    actor.send({ type: 'RESET_JOURNEY' });
    expect(actor.getSnapshot().value).toBe('day0_onboarding');
    expect(actor.getSnapshot().context.currentStepIndex).toBe(0);
    expect(actor.getSnapshot().context.completedStepIds).toEqual([]);
  });

  it('persists and restores snapshot across actor instances', () => {
    const actor1 = createRoleJourneyActor('principal');
    actor1.send({ type: 'ADVANCE_STEP', stepId: 'reviewed_curriculum' });
    actor1.send({ type: 'COMPLETE_MILESTONE', stepId: 'claimed_school' });

    // The stored snapshot is XState's own, stamped with the machine's identity.
    expect(loadJourneySnapshot('principal')).toMatchObject({
      machine: { id: 'roleJourney', version: roleJourneyMachine.version },
    });

    const actor2 = createRoleJourneyActor('principal');
    expect(actor2.getSnapshot().value).toBe('day1_operational');
    expect(actor2.getSnapshot().context.completedStepIds).toContain('claimed_school');
  });

  it.each([
    [
      'the pre-versioning envelope',
      { version: 2, savedAt: new Date().toISOString(), snapshot: { value: 'day1_operational' } },
    ],
    ['another machine version', { value: 'day1_operational', machine: { id: 'roleJourney', version: '999' } }],
    ['a state the machine does not have', { value: 'nowhere', machine: { id: 'roleJourney', version: '1' } }],
  ])('drops %s and starts fresh', async (_name, stored) => {
    saveJourneySnapshot('student', stored);
    const actor = createRoleJourneyActor('student');
    expect(actor.getSnapshot().value).toBe('day0_onboarding');
    expect(actor.getSnapshot().context.completedStepIds).toEqual(['init_student']);
    // The fresh journey replaced what was stored.
    expect(loadJourneySnapshot('student')).toMatchObject({ machine: { version: '1' } });
  });

  it('drops a stored value that is not JSON', () => {
    storage.set(getJourneySnapshotStorageKey('student'), '{not json');
    expect(loadJourneySnapshot('student')).toBeNull();
    expect(storage.getString(getJourneySnapshotStorageKey('student'))).toBeUndefined();
  });
});
