import { queryDatabaseRows } from '@repo/database/client';

import {
  assignEdloveAccountId,
  type EdloveAccountIdAssignmentOptions,
  type EdloveAccountIdQueryRows,
} from './edloveAccountIdAssignment';

type HistoricalOperationRow = Readonly<{
  id: string;
  operation_key: string;
  state: 'planned' | 'approved' | 'running' | 'paused' | 'completed' | 'failed';
  max_batch_size: number;
  max_attempts_per_account: number;
  max_failed_accounts: number;
  candidate_count: number;
  assigned_count: number;
  skipped_count: number;
  failed_count: number;
}>;

type ClaimedItemRow = Readonly<{ account_id: string; claim_token: string }>;
type BooleanRow = Readonly<{ completed?: boolean; released?: boolean }>;

export type EdloveHistoricalAssignmentOperation = HistoricalOperationRow;

export type EdloveHistoricalAssignmentWorkerOptions = Readonly<{
  issuer: EdloveAccountIdAssignmentOptions['issuer'];
  onUniqueCollision: EdloveAccountIdAssignmentOptions['onUniqueCollision'];
  queryRows?: EdloveAccountIdQueryRows;
}>;

export type EdloveHistoricalAssignmentBatchResult = Readonly<{
  claimedCount: number;
  assignedCount: number;
  releasedCount: number;
  reconciledAfterLeaseCount: number;
}>;

const DEFAULT_QUERY_ROWS: EdloveAccountIdQueryRows = queryDatabaseRows;

function queryRowsFrom(options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'>) {
  return options.queryRows ?? DEFAULT_QUERY_ROWS;
}

/**
 * Private Phase 1B control seam. It has no HTTP route, scheduler, or client
 * authorization path; callers must already hold Sanctuary's database role.
 */
export class EdloveHistoricalAssignmentOperations {
  static async create(
    operationKey: string,
    maxBatchSize: number,
    maxFailedAccounts: number,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ): Promise<string> {
    const rows = await queryRowsFrom(options)<Readonly<{ operation_id: string }>>(
      'select private.create_edlove_historical_assignment_operation($1::uuid, $2::integer, $3::integer) as operation_id',
      [operationKey, maxBatchSize, maxFailedAccounts],
    );
    const operationId = rows[0]?.operation_id;
    if (!operationId) throw new Error('Historical assignment operation was not created.');
    return operationId;
  }

  static async approve(
    operationId: string,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ) {
    await queryRowsFrom(options)<never>(
      'select private.approve_edlove_historical_assignment_operation($1::uuid)',
      [operationId],
    );
  }

  static async setExecutionEnabled(
    enabled: boolean,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ) {
    await queryRowsFrom(options)<never>(
      'select private.set_edlove_historical_assignment_execution_enabled($1::boolean)',
      [enabled],
    );
  }

  static async start(
    operationId: string,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ) {
    await queryRowsFrom(options)<never>(
      'select private.start_edlove_historical_assignment_operation($1::uuid)',
      [operationId],
    );
  }

  static async pause(
    operationId: string,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ) {
    await queryRowsFrom(options)<never>(
      'select private.pause_edlove_historical_assignment_operation($1::uuid)',
      [operationId],
    );
  }

  static async summary(
    operationId: string,
    options: Pick<EdloveHistoricalAssignmentWorkerOptions, 'queryRows'> = {},
  ): Promise<EdloveHistoricalAssignmentOperation | null> {
    const rows = await queryRowsFrom(options)<HistoricalOperationRow>(
      'select * from private.get_edlove_historical_assignment_operation_summary($1::uuid)',
      [operationId],
    );
    return rows[0] ?? null;
  }

  static async processBatch(
    operationId: string,
    maxItems: number,
    options: EdloveHistoricalAssignmentWorkerOptions,
  ): Promise<EdloveHistoricalAssignmentBatchResult> {
    const queryRows = queryRowsFrom(options);
    const claims = await queryRows<ClaimedItemRow>(
      'select * from private.claim_edlove_historical_assignment_operation_items($1::uuid, $2::integer)',
      [operationId, maxItems],
    );
    let assignedCount = 0;
    let releasedCount = 0;
    let reconciledAfterLeaseCount = 0;

    for (const claim of claims) {
      try {
        await assignEdloveAccountId(claim.account_id, {
          issuer: options.issuer,
          onUniqueCollision: options.onUniqueCollision,
          queryRows,
        });
        const completionRows = await queryRows<BooleanRow>(
          'select private.complete_edlove_historical_assignment_operation_item($1::uuid, $2::uuid, $3::uuid) as completed',
          [operationId, claim.account_id, claim.claim_token],
        );
        if (completionRows[0]?.completed) assignedCount += 1;
        else reconciledAfterLeaseCount += 1;
      } catch {
        const releaseRows = await queryRows<BooleanRow>(
          'select private.release_edlove_historical_assignment_operation_item($1::uuid, $2::uuid, $3::uuid, $4::text) as released',
          [operationId, claim.account_id, claim.claim_token, 'EDLOVE_HISTORICAL_ASSIGNMENT_FAILED'],
        );
        if (releaseRows[0]?.released) releasedCount += 1;
      }
    }

    return { claimedCount: claims.length, assignedCount, releasedCount, reconciledAfterLeaseCount };
  }
}
