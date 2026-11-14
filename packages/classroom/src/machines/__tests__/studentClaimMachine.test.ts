import {
  createStudentClaimActor,
  executeStudentClaimEffect,
  studentClaimMachine,
} from '@repo/classroom/machines/studentClaimMachine';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('StudentClaimMachine v6 + Effect v4', () => {
  it('initializes in idle state with empty context', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.code).toBe('');
    expect(snapshot.context.error).toBeNull();
    expect(snapshot.context.attemptCount).toBe(0);
  });

  it('updates code and clears error in idle state', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    actor.send({ type: 'SET_CODE', code: 'abc12345' });
    expect(actor.getSnapshot().context.code).toBe('abc12345');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('rejects short code on SUBMIT without leaving idle', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    actor.send({ type: 'SET_CODE', code: 'abc' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('Please enter a valid 8-character invite code.');
  });

  it('transitions to verifying on valid code and completes via CLAIM_SUCCESS', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    actor.send({ type: 'SET_CODE', code: 'abc12345' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.code).toBe('ABC12345');

    actor.send({ type: 'CLAIM_SUCCESS', data: { studentId: 'stu-999', name: 'Aarav' } });

    expect(actor.getSnapshot().value).toBe('success');
    expect(actor.getSnapshot().context.successData).toEqual({
      studentId: 'stu-999',
      name: 'Aarav',
    });
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('handles CLAIM_FAILURE and increments attemptCount', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    actor.send({ type: 'SET_CODE', code: 'xyz98765' });
    actor.send({ type: 'SUBMIT' });

    actor.send({ type: 'CLAIM_FAILURE', error: 'Code already claimed by another student.' });

    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Code already claimed by another student.');
    expect(actor.getSnapshot().context.attemptCount).toBe(1);

    // Typing new code resets to idle
    actor.send({ type: 'SET_CODE', code: 'new12345' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('resets context on RESET event', () => {
    const actor = createActor(studentClaimMachine);
    actor.start();

    actor.send({ type: 'SET_CODE', code: 'ABCDEFGH' });
    actor.send({ type: 'SUBMIT' });
    actor.send({ type: 'CLAIM_SUCCESS', data: { ok: true } });

    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.code).toBe('');
    expect(actor.getSnapshot().context.successData).toBeNull();
  });

  it('executes successful claim via executeStudentClaimEffect', async () => {
    const actor = createStudentClaimActor();
    actor.send({ type: 'SET_CODE', code: 'VALID123' });

    const mockApi = vi.fn().mockResolvedValue({ id: 's1', classId: 'c1' });

    const result = await executeStudentClaimEffect(actor, 'VALID123', mockApi);

    expect(mockApi).toHaveBeenCalledWith('VALID123');
    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('success');
  });

  it('executes failed claim via executeStudentClaimEffect gracefully', async () => {
    const actor = createStudentClaimActor();
    actor.send({ type: 'SET_CODE', code: 'BADCODE1' });

    const mockApi = vi.fn().mockRejectedValue(new Error('Invite code expired.'));

    const result = await executeStudentClaimEffect(actor, 'BADCODE1', mockApi);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invite code expired.');
    }
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Invite code expired.');
  });
});
