import {
  createStudentVerificationActor,
  executeStudentVerificationEffect,
  restorePoaClaims,
  savePoaClaimSnapshot,
  studentVerificationMachine,
} from '@repo/classroom/machines/studentVerificationMachine';
import { storage } from '@repo/core/logic/managers/StorageManager';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('StudentVerificationMachine v6 + Effect-TS v4', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('initializes in idle state', () => {
    const actor = createActor(studentVerificationMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.token).toBeNull();
    expect(actor.getSnapshot().context.student).toBeNull();
  });

  it('transitions through START_SCAN and SUBMIT_TOKEN to verifying', () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    actor.send({ type: 'START_SCAN' });
    expect(actor.getSnapshot().value).toBe('scanning');

    actor.send({ type: 'SUBMIT_TOKEN', token: 'INST_TOKEN_999', method: 'qr' });
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.token).toBe('INST_TOKEN_999');
    expect(actor.getSnapshot().context.method).toBe('qr');
  });

  it('handles VERIFICATION_SUCCESS and records claim and history', () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    actor.send({ type: 'SUBMIT_TOKEN', token: 'INST_TOKEN_999' });
    actor.send({
      type: 'VERIFICATION_SUCCESS',
      student: {
        id: 'rec-1',
        student_id: 'stu-kamal',
        full_name: 'Kamal Perera',
        roll_number: '10A-01',
      },
      poaClaimId: 'poa-claim-uuid-777',
    });

    expect(actor.getSnapshot().value).toBe('verified');
    expect(actor.getSnapshot().context.poaClaimId).toBe('poa-claim-uuid-777');
    expect(actor.getSnapshot().context.student?.full_name).toBe('Kamal Perera');
    expect(actor.getSnapshot().context.historyCount).toBe(1);
  });

  it('handles VERIFICATION_FAILURE and transitions to rejected', () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    actor.send({ type: 'SUBMIT_TOKEN', token: 'INVALID_TOKEN' });
    actor.send({ type: 'VERIFICATION_FAILURE', error: 'Student not enrolled in this classroom' });

    expect(actor.getSnapshot().value).toBe('rejected');
    expect(actor.getSnapshot().context.error).toBe('Student not enrolled in this classroom');
  });

  it('executes executeStudentVerificationEffect successfully with anti-spoof check', async () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    const mockVerify = vi.fn().mockResolvedValue({
      student: {
        id: 'rec-2',
        student_id: 'stu-nimal',
        full_name: 'Nimal Silva',
        roll_number: '10A-02',
      },
      poaClaimId: 'poa-claim-nimal',
      antiSpoofPassed: true,
    });

    const result = await executeStudentVerificationEffect(actor, 'TOKEN_NIMAL', {
      verifyToken: mockVerify,
      method: 'nfc',
    });

    expect(result.success).toBe(true);
    expect(result.student?.full_name).toBe('Nimal Silva');
    expect(result.poaClaimId).toBe('poa-claim-nimal');
    expect(actor.getSnapshot().value).toBe('verified');
    expect(actor.getSnapshot().context.method).toBe('nfc');
  });

  it('rejects verification when anti-spoof check fails', async () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    const mockVerify = vi.fn().mockResolvedValue({
      student: {
        id: 'rec-3',
        student_id: 'stu-spoof',
        full_name: 'Spoofed Student',
      },
      poaClaimId: 'poa-claim-spoof',
      antiSpoofPassed: false,
    });

    const result = await executeStudentVerificationEffect(actor, 'SPOOFED_TOKEN', {
      verifyToken: mockVerify,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Anti-spoof replay detected or expired security nonce.');
    expect(actor.getSnapshot().value).toBe('rejected');
  });

  it('safely handles actor disposal/stop mid-flight in executeStudentVerificationEffect', async () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    const mockVerify = vi.fn().mockImplementation(async () => {
      actor.stop();
      return {
        student: {
          id: 'rec-disp',
          student_id: 'stu-disp',
          full_name: 'Disposed Student',
        },
        poaClaimId: 'poa-disp',
        antiSpoofPassed: true,
      };
    });

    const result = await executeStudentVerificationEffect(actor, 'DISP_TOKEN', {
      verifyToken: mockVerify,
    });

    expect(result.success).toBe(true);
    expect(result.student?.full_name).toBe('Disposed Student');
    expect(actor.getSnapshot().status).toBe('stopped');
  });

  it('persists and restores POA claims with partitioned keys', () => {
    const actor = createStudentVerificationActor({
      classroomId: 'class-101',
      date: '2026-10-28',
    });

    actor.send({ type: 'SUBMIT_TOKEN', token: 'TOKEN_1' });
    actor.send({
      type: 'VERIFICATION_SUCCESS',
      student: {
        id: 'rec-1',
        student_id: 'stu-1',
        full_name: 'Kamal',
      },
      poaClaimId: 'poa-123',
    });

    savePoaClaimSnapshot(actor, { tenantId: 'school-A' });

    const claims = restorePoaClaims('class-101', { tenantId: 'school-A' });
    expect(claims.length).toBe(1);
    expect((claims[0] as any).poaClaimId).toBe('poa-123');

    // Tenant B should be completely isolated
    const claimsB = restorePoaClaims('class-101', { tenantId: 'school-B' });
    expect(claimsB.length).toBe(0);
  });
});
