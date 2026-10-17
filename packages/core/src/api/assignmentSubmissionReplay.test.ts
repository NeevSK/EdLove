import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AssignmentSubmissionReplayTransport,
  replayAssignmentSubmissionWithTransport,
} from './assignmentSubmissionReplay';

describe('shared assignment submission replay executor', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const commandId = '123e4567-e89b-12d3-a456-426614174001';
  const assignmentId = '123e4567-e89b-12d3-a456-426614174002';
  const submissionId = '123e4567-e89b-12d3-a456-426614174003';
  const intent = { assignmentId, content: 'Work' };
  const submission = {
    id: submissionId,
    assignment_id: assignmentId,
    student_id: userId,
    classroom_id: '123e4567-e89b-12d3-a456-426614174004',
    content: 'Work',
    submitted_at: '2026-10-15T00:00:00.000Z',
    grade: null,
    feedback: null,
    graded_at: null,
    idempotency_key: commandId,
  };
  const receipt = {
    operationId: '123e4567-e89b-12d3-a456-426614174005',
    capability: 'assignment.submit',
    status: 'committed',
    result: { submissionId },
    errorCode: null,
    createdAt: '2026-10-15T00:00:00.000Z',
    updatedAt: '2026-10-15T00:00:00.000Z',
  } as const;
  const submit = vi.fn<AssignmentSubmissionReplayTransport['submitAssignment']>();
  const recover = vi.fn<AssignmentSubmissionReplayTransport['getOperationReceiptByKey']>();
  const assertPlatformAccount = vi.fn<(accountId: string) => void | Promise<void>>();
  const transport: AssignmentSubmissionReplayTransport = {
    submitAssignment: submit,
    getOperationReceiptByKey: recover,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    submit.mockResolvedValue(submission);
    recover.mockResolvedValue(receipt);
  });

  it('uses the supplied canonical account and command UUID through both requests', async () => {
    await expect(
      replayAssignmentSubmissionWithTransport(intent, {
        commandId,
        expectedCanonicalAccountId: userId,
        transport,
        assertPlatformAccount,
      }),
    ).resolves.toEqual(receipt);

    expect(assertPlatformAccount).toHaveBeenCalledTimes(3);
    expect(submit).toHaveBeenCalledWith(
      { params: { assignmentId }, body: { content: 'Work', idempotencyKey: commandId } },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
    expect(recover).toHaveBeenCalledWith(
      { query: { capability: 'assignment.submit', idempotencyKey: commandId } },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
  });

  it('awaits the account guard before dispatch and between the two network calls', async () => {
    const events: string[] = [];
    assertPlatformAccount.mockImplementation(async () => {
      await Promise.resolve();
      events.push('guard');
    });
    submit.mockImplementation(async () => {
      events.push('submit');
      return submission;
    });
    recover.mockImplementation(async () => {
      events.push('receipt');
      return receipt;
    });

    await replayAssignmentSubmissionWithTransport(intent, {
      commandId,
      expectedCanonicalAccountId: userId,
      transport,
      assertPlatformAccount,
    });

    expect(events).toEqual(['guard', 'submit', 'guard', 'receipt', 'guard']);
  });

  it('stops before receipt recovery when the platform account changes after submit', async () => {
    const changedAccount = new Error('account changed');
    assertPlatformAccount.mockResolvedValueOnce(undefined).mockRejectedValueOnce(changedAccount);

    await expect(
      replayAssignmentSubmissionWithTransport(intent, {
        commandId,
        expectedCanonicalAccountId: userId,
        transport,
        assertPlatformAccount,
      }),
    ).rejects.toBe(changedAccount);
    expect(submit).toHaveBeenCalledOnce();
    expect(recover).not.toHaveBeenCalled();
  });
});
