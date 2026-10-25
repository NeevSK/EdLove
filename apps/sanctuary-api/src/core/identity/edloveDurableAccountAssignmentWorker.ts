import { edloveUuidV8MintOrigin } from '@repo/core/logic/utils/edloveUuidV8';
import { queryDatabaseRows } from '@repo/database/client';

import { sanctuaryInngest } from '../../agents/inngest';
import { assignEdloveAccountId } from './edloveAccountIdAssignment';
import { createEdloveUuidV8Issuer } from './edloveUuidV8Issuer';

type PendingAccountRow = Readonly<{ account_id: string; claim_token: string }>;

const MAX_BATCH_SIZE = 25;
const assignmentIssuer = createEdloveUuidV8Issuer({
  mintOrigin:
    process.env.NODE_ENV === 'production'
      ? edloveUuidV8MintOrigin.centralProduction
      : edloveUuidV8MintOrigin.nonProduction,
  onClockRollback: ({ observedAtUnixMilliseconds, retainedAtUnixMilliseconds }) => {
    console.warn('[edlove-identity] UUIDv8 issuer clock rollback retained logical time', {
      observedAtUnixMilliseconds,
      retainedAtUnixMilliseconds,
    });
  },
});

function sanitizedErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code.slice(0, 96);
  }
  return 'EDLOVE_ACCOUNT_ID_ASSIGNMENT_FAILED';
}

export async function processPendingEdloveAccountAssignments(options?: {
  queryRows?: typeof queryDatabaseRows;
  assign?: (canonicalAccountId: string) => Promise<string>;
}): Promise<{ processedCount: number }> {
  const queryRows = options?.queryRows ?? queryDatabaseRows;
  const assign =
    options?.assign ??
    ((canonicalAccountId: string) =>
      assignEdloveAccountId(canonicalAccountId, {
        issuer: assignmentIssuer,
        onUniqueCollision: ({ attempt }) => {
          // Account identifiers are not operational correlation data. The
          // private assignment function remains the authoritative record.
          console.warn('[edlove-identity] UUIDv8 collision retry', { attempt });
        },
      }));
  const pending = await queryRows<PendingAccountRow>(
    `select account_id, claim_token
       from private.claim_edlove_account_assignment_requests($1::integer)`,
    [MAX_BATCH_SIZE],
  );

  let failedCount = 0;

  for (const { account_id: accountId, claim_token: claimToken } of pending) {
    try {
      await assign(accountId);
      await queryRows(
        `update private.edlove_account_assignment_requests
            set completed_at = now(), last_error_code = null,
                claim_token = null, claim_expires_at = null
          where account_id = $1::uuid and claim_token = $2::uuid and completed_at is null`,
        [accountId, claimToken],
      );
    } catch (error) {
      failedCount += 1;
      try {
        await queryRows(
          `update private.edlove_account_assignment_requests
              set attempts = attempts + 1, last_error_code = $3,
                  claim_token = null, claim_expires_at = null
            where account_id = $1::uuid and claim_token = $2::uuid and completed_at is null`,
          [accountId, claimToken, sanitizedErrorCode(error)],
        );
      } catch (releaseError) {
        // Do not hold later claimed requests hostage when the failure record
        // itself is unavailable. Its lease makes this request retryable.
        console.error('[edlove-identity] assignment failure release unavailable', {
          errorCode: sanitizedErrorCode(releaseError),
        });
      }
    }
  }

  if (failedCount > 0) {
    console.warn('[edlove-identity] durable account assignment batch had failures', {
      failedCount,
    });
  }

  return { processedCount: pending.length };
}

export async function runEdloveDurableAccountAssignmentWorker(options?: {
  isEnabled?: boolean;
  processPending?: typeof processPendingEdloveAccountAssignments;
}): Promise<{ outcome: 'disabled' | 'processed'; processedCount: number }> {
  const isEnabled =
    options?.isEnabled ?? process.env.EDLOVE_ACCOUNT_ID_ASSIGNMENT_WORKER_ENABLED === 'true';
  if (!isEnabled) {
    return { outcome: 'disabled', processedCount: 0 };
  }

  const result = await (options?.processPending ?? processPendingEdloveAccountAssignments)();
  console.info('[edlove-identity] durable account assignment batch processed', {
    processedCount: result.processedCount,
  });
  return { outcome: 'processed', ...result };
}

export const edloveDurableAccountAssignmentWorker = sanctuaryInngest.createFunction(
  {
    id: 'edlove-durable-account-assignment',
    retries: 3,
    concurrency: 1,
    triggers: [{ cron: '*/5 * * * *' }],
  },
  async () => runEdloveDurableAccountAssignmentWorker(),
);
