import {
  createOnboardingJourneyActor,
  executeOnboardingCompletionEffect,
  onboardingJourneyMachine,
  restoreOnboardingSnapshot,
  saveOnboardingSnapshot,
} from '@repo/ui/machines/onboardingJourneyMachine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';
import { storage } from '@repo/core/logic/managers/StorageManager';

describe('OnboardingJourneyMachine v6 + Effect v4', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('initializes in arrival state at step 0', () => {
    const actor = createActor(onboardingJourneyMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('arrival');
    expect(snapshot.context.currentStep).toBe(0);
    expect(snapshot.context.name).toBe('');
    expect(snapshot.context.selectedCapacity).toBe('teacher');
  });

  it('rejects NEXT_STEP in arrival if name is empty', () => {
    const actor = createActor(onboardingJourneyMachine);
    actor.start();

    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('arrival');
    expect(actor.getSnapshot().context.error).toBe('Please enter a name to continue.');
  });

  it('advances from arrival to identity when name is provided', () => {
    const actor = createActor(onboardingJourneyMachine);
    actor.start();

    actor.send({ type: 'SET_NAME', name: 'Dev Teacher' });
    expect(actor.getSnapshot().context.name).toBe('Dev Teacher');

    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('identity');
    expect(actor.getSnapshot().context.currentStep).toBe(1);
  });

  it('transitions sequentially through tour steps to review', () => {
    const actor = createActor(onboardingJourneyMachine);
    actor.start();

    // Step 0 -> 1
    actor.send({ type: 'SET_NAME', name: 'Maya' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('identity');

    // Step 1 -> 2
    actor.send({ type: 'SET_CAPACITY', capacity: 'student' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('tour');
    expect(actor.getSnapshot().context.currentStep).toBe(2);

    // Step 2 -> 3
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(3);

    // Step 3 -> 4
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(4);

    // Step 4 -> 5
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(5);

    // Step 5 -> 6 (review)
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('review');
    expect(actor.getSnapshot().context.currentStep).toBe(6);
  });

  it('allows skipping tour directly to review', () => {
    const actor = createActor(onboardingJourneyMachine);
    actor.start();

    actor.send({ type: 'SET_NAME', name: 'Alex' });
    actor.send({ type: 'NEXT_STEP' });
    actor.send({ type: 'NEXT_STEP' }); // at tour step 2
    expect(actor.getSnapshot().value).toBe('tour');

    actor.send({ type: 'SKIP_TOUR' });
    expect(actor.getSnapshot().value).toBe('review');
    expect(actor.getSnapshot().context.currentStep).toBe(6);
  });

  it('persists and restores snapshot seamlessly via StorageManager', () => {
    const userId = 'usr-test-123';
    const actor = createOnboardingJourneyActor();

    actor.send({ type: 'SET_NAME', name: 'Saraswati' });
    actor.send({ type: 'NEXT_STEP' });
    actor.send({ type: 'SET_CAPACITY', capacity: 'principal' });

    saveOnboardingSnapshot(actor, userId);

    const freshActor = createOnboardingJourneyActor();
    const restored = restoreOnboardingSnapshot(freshActor, userId);

    expect(restored).toBe(true);
    expect(freshActor.getSnapshot().context.name).toBe('Saraswati');
    expect(freshActor.getSnapshot().context.selectedCapacity).toBe('principal');
  });

  it('executes onboarding completion effect successfully', async () => {
    const actor = createOnboardingJourneyActor({
      name: 'Guru',
      selectedCapacity: 'teacher',
      currentStep: 6,
    });

    const mockResolveSubject = vi.fn().mockResolvedValue({
      internalId: 'usr-456',
      isAnonymous: false,
    });
    const mockCreateBond = vi.fn().mockResolvedValue(undefined);
    const mockCompleteOnboarding = vi.fn().mockResolvedValue(undefined);

    const result = await executeOnboardingCompletionEffect(actor, {
      resolveSubject: mockResolveSubject,
      createInitialBond: mockCreateBond,
      completeOnboarding: mockCompleteOnboarding,
    });

    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('completed');
    expect(mockResolveSubject).toHaveBeenCalled();
    expect(mockCreateBond).toHaveBeenCalledWith(
      'teacher',
      expect.objectContaining({ name: 'Guru' }),
      'usr-456',
      false,
    );
    expect(mockCompleteOnboarding).toHaveBeenCalledWith('usr-456', false);
  });

  it('handles onboarding completion failure gracefully and transitions to error', async () => {
    const actor = createOnboardingJourneyActor({
      name: 'Guru',
      selectedCapacity: 'teacher',
      currentStep: 6,
    });

    const mockResolveSubject = vi.fn().mockRejectedValue(new Error('Network timeout'));

    const result = await executeOnboardingCompletionEffect(actor, {
      resolveSubject: mockResolveSubject,
      createInitialBond: vi.fn(),
      completeOnboarding: vi.fn(),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network timeout');
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Network timeout');
  });
});
