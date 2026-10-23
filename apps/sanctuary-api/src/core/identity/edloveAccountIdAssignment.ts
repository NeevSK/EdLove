import { edloveUuidV8Subtype } from '@repo/core/logic/utils/edloveUuidV8';
import { queryDatabaseRows } from '@repo/database/client';

export type EdloveAccountIdQueryRows = <T>(
  query: string,
  parameters: readonly unknown[],
) => Promise<T[]>;

type AccountIdRow = Readonly<{
  edlove_id: string | null;
}>;

export type EdloveAccountIdIssuer = Readonly<{
  issue: (subtype: typeof edloveUuidV8Subtype.account) => string;
}>;

export type EdloveAccountIdAssignmentOptions = Readonly<{
  issuer: EdloveAccountIdIssuer;
  onUniqueCollision: (event: { canonicalAccountId: string; attempt: number }) => void;
  queryRows?: EdloveAccountIdQueryRows;
  maxAttempts?: number;
}>;

export class EdloveAccountIdAssignmentError extends Error {
  constructor(
    readonly code:
      | 'EDLOVE_ACCOUNT_ID_INVALID_CANONICAL_ID'
      | 'EDLOVE_ACCOUNT_ID_ACCOUNT_NOT_ELIGIBLE'
      | 'EDLOVE_ACCOUNT_ID_COLLISION_EXHAUSTED',
  ) {
    super(code);
    this.name = 'EdloveAccountIdAssignmentError';
  }
}

const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_MAX_ATTEMPTS = 3;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}

export function assertEdloveCanonicalAccountId(canonicalAccountId: string): void {
  if (!CANONICAL_UUID_PATTERN.test(canonicalAccountId) || canonicalAccountId === NIL_UUID) {
    throw new EdloveAccountIdAssignmentError('EDLOVE_ACCOUNT_ID_INVALID_CANONICAL_ID');
  }
}

function assertMaxAttempts(maxAttempts: number): void {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 3) {
    throw new RangeError('maxAttempts must be a safe integer between 1 and 3.');
  }
}

/**
 * Assigns an EdLove account identifier without changing the canonical account
 * key. The database statement locks one eligible account, so a concurrent
 * caller observes the winner rather than minting a replacement value.
 */
export async function assignEdloveAccountId(
  canonicalAccountId: string,
  options: EdloveAccountIdAssignmentOptions,
): Promise<string> {
  assertEdloveCanonicalAccountId(canonicalAccountId);

  const queryRows = options.queryRows ?? queryDatabaseRows;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  assertMaxAttempts(maxAttempts);

  const existingRows = await queryRows<AccountIdRow>(
    `select edlove_id
       from public.users
      where id = $1
        and deleted_at is null`,
    [canonicalAccountId],
  );
  const existing = existingRows[0];
  if (!existing) {
    throw new EdloveAccountIdAssignmentError('EDLOVE_ACCOUNT_ID_ACCOUNT_NOT_ELIGIBLE');
  }
  if (existing.edlove_id) return existing.edlove_id;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const candidate = options.issuer.issue(edloveUuidV8Subtype.account);

    try {
      const rows = await queryRows<AccountIdRow>(
        `with target as materialized (
           select id, edlove_id
             from public.users
            where id = $1
              and deleted_at is null
            for update
         ), assigned as (
           update public.users as account
              set edlove_id = $2
             from target
            where account.id = target.id
              and target.edlove_id is null
            returning account.edlove_id
         )
         select edlove_id from assigned
         union all
         select edlove_id from target where edlove_id is not null
         limit 1`,
        [canonicalAccountId, candidate],
      );

      const assigned = rows[0]?.edlove_id;
      if (assigned) return assigned;

      throw new EdloveAccountIdAssignmentError('EDLOVE_ACCOUNT_ID_ACCOUNT_NOT_ELIGIBLE');
    } catch (error) {
      if (error instanceof EdloveAccountIdAssignmentError) throw error;
      if (!isUniqueViolation(error)) throw error;

      options.onUniqueCollision({ canonicalAccountId, attempt });
    }
  }

  throw new EdloveAccountIdAssignmentError('EDLOVE_ACCOUNT_ID_COLLISION_EXHAUSTED');
}
