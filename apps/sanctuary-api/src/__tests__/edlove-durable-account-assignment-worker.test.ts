import { describe, expect, it, vi } from 'vitest';

import {
  processPendingEdloveAccountAssignments,
  runEdloveDurableAccountAssignmentWorker,
} from '../core/identity/edloveDurableAccountAssignmentWorker';

const accountId = '123e4567-e89b-8101-8000-426614174020';
const claimToken = '123e4567-e89b-12d3-a456-426614174021';

describe('durable EdLove account assignment worker', () => {
  it('is disabled unless the server explicitly enables the worker', async () => {
    const processPending = vi.fn();

    await expect(
      runEdloveDurableAccountAssignmentWorker({ isEnabled: false, processPending }),
    ).resolves.toEqual({ outcome: 'disabled', processedCount: 0 });

    expect(processPending).not.toHaveBeenCalled();
  });

  it('reports only a batch count when the enabled worker completes', async () => {
    const processPending = vi.fn().mockResolvedValue({ processedCount: 2 });

    await expect(
      runEdloveDurableAccountAssignmentWorker({ isEnabled: true, processPending }),
    ).resolves.toEqual({ outcome: 'processed', processedCount: 2 });
  });

  it('assigns only private-ledger candidates and marks the request complete', async () => {
    const queryRows = vi
      .fn()
      .mockResolvedValueOnce([{ account_id: accountId, claim_token: claimToken }])
      .mockResolvedValueOnce([]);
    const assign = vi.fn().mockResolvedValue('01234567-89ab-8101-8000-010203040506');

    await expect(processPendingEdloveAccountAssignments({ queryRows, assign })).resolves.toEqual({
      processedCount: 1,
    });

    expect(assign).toHaveBeenCalledWith(accountId);
    expect(String(queryRows.mock.calls[0]?.[0])).toContain(
      'private.claim_edlove_account_assignment_requests',
    );
    expect(String(queryRows.mock.calls[1]?.[0])).toContain('completed_at = now()');
    expect(queryRows.mock.calls[1]?.[1]).toEqual([accountId, claimToken]);
  });

  it('retains a failed request for retry with only a sanitized code', async () => {
    const queryRows = vi
      .fn()
      .mockResolvedValueOnce([{ account_id: accountId, claim_token: claimToken }])
      .mockResolvedValueOnce([]);
    const failure = Object.assign(new Error('private provider subject must not leak'), {
      code: 'EDLOVE_ACCOUNT_ID_COLLISION_EXHAUSTED',
    });

    await expect(
      processPendingEdloveAccountAssignments({
        queryRows,
        assign: vi.fn().mockRejectedValue(failure),
      }),
    ).resolves.toEqual({ processedCount: 1 });

    expect(String(queryRows.mock.calls[1]?.[0])).toContain('attempts = attempts + 1');
    expect(queryRows.mock.calls[1]?.[1]).toEqual([
      accountId,
      claimToken,
      'EDLOVE_ACCOUNT_ID_COLLISION_EXHAUSTED',
    ]);
  });

  it('continues the batch after a failure so later claims do not wait for lease expiry', async () => {
    const secondAccountId = '123e4567-e89b-12d3-a456-426614174022';
    const secondClaimToken = '123e4567-e89b-12d3-a456-426614174023';
    const queryRows = vi
      .fn()
      .mockResolvedValueOnce([
        { account_id: accountId, claim_token: claimToken },
        { account_id: secondAccountId, claim_token: secondClaimToken },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const assign = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('first assignment failed'), { code: 'TEMPORARY' }),
      )
      .mockResolvedValueOnce('01234567-89ab-8101-8000-010203040506');

    await expect(processPendingEdloveAccountAssignments({ queryRows, assign })).resolves.toEqual({
      processedCount: 2,
    });

    expect(assign).toHaveBeenNthCalledWith(1, accountId);
    expect(assign).toHaveBeenNthCalledWith(2, secondAccountId);
    expect(String(queryRows.mock.calls[2]?.[0])).toContain('completed_at = now()');
  });

  it('repairs a request after assignment succeeded but its completion write failed', async () => {
    const completionFailure = Object.assign(new Error('temporary ledger write failure'), {
      code: 'CONNECTION_FAILURE',
    });
    const firstRunQueryRows = vi
      .fn()
      .mockResolvedValueOnce([{ account_id: accountId, claim_token: claimToken }])
      .mockRejectedValueOnce(completionFailure)
      .mockResolvedValueOnce([]);
    const secondRunQueryRows = vi
      .fn()
      .mockResolvedValueOnce([{ account_id: accountId, claim_token: claimToken }])
      .mockResolvedValueOnce([]);
    const assign = vi.fn().mockResolvedValue('01234567-89ab-8101-8000-010203040506');

    await expect(
      processPendingEdloveAccountAssignments({ queryRows: firstRunQueryRows, assign }),
    ).resolves.toEqual({ processedCount: 1 });
    await expect(
      processPendingEdloveAccountAssignments({ queryRows: secondRunQueryRows, assign }),
    ).resolves.toEqual({ processedCount: 1 });

    expect(assign).toHaveBeenCalledTimes(2);
    expect(String(secondRunQueryRows.mock.calls[1]?.[0])).toContain('completed_at = now()');
  });
});
