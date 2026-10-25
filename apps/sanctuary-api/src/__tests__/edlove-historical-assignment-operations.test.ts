import { describe, expect, it, vi } from 'vitest';

import type { EdloveAccountIdQueryRows } from '../core/identity/edloveAccountIdAssignment';
import { EdloveHistoricalAssignmentOperations } from '../core/identity/edloveHistoricalAssignmentOperations';

const issuer = { issue: vi.fn(() => '018f2f5c-18d8-8a80-8000-000000000001') };
const onUniqueCollision = vi.fn();

describe('EdloveHistoricalAssignmentOperations', () => {
  it('uses the private operation lifecycle and returns its durable operation id', async () => {
    const calls: string[] = [];
    const queryRows: EdloveAccountIdQueryRows = async <T>(query: string) => {
      calls.push(query);
      if (query.includes('create_edlove_historical_assignment_operation')) {
        return [{ operation_id: 'f0500000-0000-4000-8000-000000000001' }] as T[];
      }
      return [] as T[];
    };

    await expect(
      EdloveHistoricalAssignmentOperations.create('f0500000-0000-4000-8000-000000000002', 10, 2, {
        queryRows,
      }),
    ).resolves.toBe('f0500000-0000-4000-8000-000000000001');
    await EdloveHistoricalAssignmentOperations.approve('f0500000-0000-4000-8000-000000000001', {
      queryRows,
    });
    await EdloveHistoricalAssignmentOperations.setExecutionEnabled(true, { queryRows });
    await EdloveHistoricalAssignmentOperations.start('f0500000-0000-4000-8000-000000000001', {
      queryRows,
    });

    expect(calls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('create_edlove_historical_assignment_operation'),
        expect.stringContaining('approve_edlove_historical_assignment_operation'),
        expect.stringContaining('set_edlove_historical_assignment_execution_enabled'),
        expect.stringContaining('start_edlove_historical_assignment_operation'),
      ]),
    );
  });

  it('assigns only claimed accounts and records a sanitized failure through the private ledger', async () => {
    const calls: Array<readonly [string, readonly unknown[]]> = [];
    const queryRows: EdloveAccountIdQueryRows = async <T>(
      query: string,
      parameters: readonly unknown[],
    ) => {
      calls.push([query, parameters]);
      if (query.includes('claim_edlove_historical_assignment_operation_items')) {
        return [
          {
            account_id: 'f0500000-0000-4000-8000-000000000010',
            claim_token: 'f0500000-0000-4000-8000-000000000011',
          },
          {
            account_id: 'f0500000-0000-4000-8000-000000000020',
            claim_token: 'f0500000-0000-4000-8000-000000000021',
          },
        ] as T[];
      }
      if (query.includes('from public.users')) {
        const accountId = String(parameters[0]);
        return accountId.endsWith('20') ? ([] as T[]) : ([{ edlove_id: null }] as T[]);
      }
      if (query.includes('private.assign_edlove_account_id'))
        return [{ edlove_id: '018f2f5c-18d8-8a80-8000-000000000001' }] as T[];
      if (query.includes('complete_edlove_historical_assignment_operation_item'))
        return [{ completed: true }] as T[];
      if (query.includes('release_edlove_historical_assignment_operation_item'))
        return [{ released: true }] as T[];
      return [] as T[];
    };

    await expect(
      EdloveHistoricalAssignmentOperations.processBatch('f0500000-0000-4000-8000-000000000001', 2, {
        issuer,
        onUniqueCollision,
        queryRows,
      }),
    ).resolves.toEqual({
      claimedCount: 2,
      assignedCount: 1,
      releasedCount: 1,
      reconciledAfterLeaseCount: 0,
    });

    expect(calls).toContainEqual(
      expect.arrayContaining([
        expect.stringContaining('release_edlove_historical_assignment_operation_item'),
        expect.arrayContaining(['EDLOVE_HISTORICAL_ASSIGNMENT_FAILED']),
      ]),
    );
  });
});
