import {
  authOrchestrationMachine,
  createAuthOrchestrationActor,
  executePasswordAuthEffect,
} from '@repo/ui/machines/authOrchestrationMachine';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('authOrchestrationMachine (XState v6 + Effect v4)', () => {
  it('initializes in idle state with empty credentials', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.email).toBe('');
    expect(snapshot.context.password).toBe('');
    expect(snapshot.context.showScanner).toBe(false);
    expect(snapshot.context.showSyncModal).toBe(false);
  });

  it('updates form fields and errors cleanly', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    actor.send({ type: 'SET_FIELD', field: 'email', value: 'guru@sanctuary.in' });
    actor.send({ type: 'SET_FIELD', field: 'password', value: 'secretpass123' });

    let snapshot = actor.getSnapshot();
    expect(snapshot.context.email).toBe('guru@sanctuary.in');
    expect(snapshot.context.password).toBe('secretpass123');

    actor.send({ type: 'SET_ERRORS', errors: { form: 'Invalid credentials' } });
    snapshot = actor.getSnapshot();
    expect(snapshot.context.errors.form).toBe('Invalid credentials');

    actor.send({ type: 'RESET_ERRORS' });
    expect(actor.getSnapshot().context.errors).toEqual({});
  });

  it('coordinates modal dialog states (scanner, pin, sync)', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    actor.send({ type: 'OPEN_SCANNER' });
    expect(actor.getSnapshot().context.showScanner).toBe(true);

    actor.send({ type: 'CLOSE_SCANNER' });
    expect(actor.getSnapshot().context.showScanner).toBe(false);

    actor.send({ type: 'OPEN_PIN_MODAL', accountId: 'acc-456' });
    expect(actor.getSnapshot().context.pendingPinAccountId).toBe('acc-456');

    actor.send({ type: 'SET_PIN_ERROR', error: 'Incorrect PIN' });
    expect(actor.getSnapshot().context.pinError).toBe('Incorrect PIN');

    actor.send({ type: 'CLOSE_PIN_MODAL' });
    expect(actor.getSnapshot().context.pendingPinAccountId).toBeNull();
  });

  it('transitions to syncing_guest_data when guest data is present, then to authenticated', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    actor.send({ type: 'START_AUTHENTICATING' });
    expect(actor.getSnapshot().value).toBe('authenticating');

    actor.send({
      type: 'AUTH_SUCCESS',
      guestSourceId: 'guest-789',
      newUserId: 'usr-target-001',
      hasGuestData: true,
    });

    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('syncing_guest_data');
    expect(snapshot.context.showSyncModal).toBe(true);
    expect(snapshot.context.newUserId).toBe('usr-target-001');

    actor.send({ type: 'CLOSE_SYNC_MODAL' });
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('authenticated');
    expect(snapshot.context.showSyncModal).toBe(false);
  });

  it('transitions directly to authenticated when no guest data exists', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    actor.send({ type: 'START_AUTHENTICATING' });
    actor.send({
      type: 'AUTH_SUCCESS',
      hasGuestData: false,
    });

    expect(actor.getSnapshot().value).toBe('authenticated');
  });

  it('handles auth failure and returns to idle with error message', () => {
    const actor = createActor(authOrchestrationMachine);
    actor.start();

    actor.send({ type: 'START_AUTHENTICATING' });
    actor.send({ type: 'AUTH_FAILURE', error: 'Invalid password.' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.errors.form).toBe('Invalid password.');
  });

  it('executes executePasswordAuthEffect with Effect-TS v4 successfully', async () => {
    const actor = createAuthOrchestrationActor({
      email: 'teacher@edlove.org',
      password: 'password123',
    });

    const mockDependencies = {
      signIn: vi.fn().mockResolvedValue({
        session: { access_token: 'tok_123' },
        user: { id: 'usr-real-999' },
      }),
      prepareGuestConversion: vi.fn().mockResolvedValue(null),
      authorizeTransfer: vi.fn().mockResolvedValue(undefined),
      bindGuestConversionTarget: vi.fn().mockResolvedValue(undefined),
      getMyInternalId: vi.fn().mockResolvedValue('usr-real-999'),
      hasGuestData: vi.fn().mockResolvedValue(false),
      clearTransferAuth: vi.fn().mockResolvedValue(undefined),
    };

    const result = await executePasswordAuthEffect(actor, mockDependencies);
    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('authenticated');
    expect(mockDependencies.signIn).toHaveBeenCalledWith('teacher@edlove.org', 'password123');
  });

  it('handles executePasswordAuthEffect failure gracefully', async () => {
    const actor = createAuthOrchestrationActor({
      email: 'teacher@edlove.org',
      password: 'wrongpassword',
    });

    const mockDependencies = {
      signIn: vi.fn().mockRejectedValue(new Error('Invalid login credentials.')),
      prepareGuestConversion: vi.fn().mockResolvedValue(null),
      authorizeTransfer: vi.fn().mockResolvedValue(undefined),
      bindGuestConversionTarget: vi.fn().mockResolvedValue(undefined),
      getMyInternalId: vi.fn().mockResolvedValue(null),
      hasGuestData: vi.fn().mockResolvedValue(false),
      clearTransferAuth: vi.fn().mockResolvedValue(undefined),
    };

    const result = await executePasswordAuthEffect(actor, mockDependencies);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid login credentials.');
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.errors.form).toBe('Invalid login credentials.');
  });
});
