import { queryDatabaseRows } from '@repo/database/client';

import {
  assertEdloveCanonicalAccountId,
  type EdloveAccountIdQueryRows,
} from './edloveAccountIdAssignment';

type AccountCandidateRow = Readonly<{
  id: string;
}>;

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;

export type EdloveAccountIdBackfillOptions = Readonly<{
  assign: (canonicalAccountId: string) => Promise<string>;
  cursor?: string;
  batchSize?: number;
  queryRows?: EdloveAccountIdQueryRows;
}>;

export type EdloveAccountIdBackfillResult = Readonly<{
  processedCount: number;
  nextCursor: string | null;
}>;

function assertBatchSize(batchSize: number): void {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new RangeError(`batchSize must be a safe integer between 1 and ${MAX_BATCH_SIZE}.`);
  }
}

/**
 * Processes a bounded, UUID-keyset page. The caller persists nextCursor only
 * after this function resolves, so a failed run is safely replayed through the
 * assignment service's existing-idempotent behavior.
 */
export async function backfillEdloveAccountIds(
  options: EdloveAccountIdBackfillOptions,
): Promise<EdloveAccountIdBackfillResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  assertBatchSize(batchSize);
  if (options.cursor) assertEdloveCanonicalAccountId(options.cursor);

  const queryRows = options.queryRows ?? queryDatabaseRows;
  const rows = await queryRows<AccountCandidateRow>(
    `select id
       from public.users
      where deleted_at is null
        and edlove_id is null
        and ($1::uuid is null or id > $1::uuid)
      order by id asc
      limit $2`,
    [options.cursor ?? null, batchSize + 1],
  );
  const page = rows.slice(0, batchSize);

  for (const candidate of page) {
    assertEdloveCanonicalAccountId(candidate.id);
    await options.assign(candidate.id);
  }

  return {
    processedCount: page.length,
    nextCursor: rows.length > batchSize ? (page.at(-1)?.id ?? null) : null,
  };
}
