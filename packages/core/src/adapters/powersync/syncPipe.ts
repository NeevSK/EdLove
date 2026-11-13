import type {
  Authenticator,
  CrudEntry,
  DownloadOptions,
  MutationUploader,
  SyncOptions,
  UploadOptions,
} from '@powersync/common';
import { SyncGrant } from '@repo/core/api/v1/contract';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { UnauthorizedError, UnavailableError } from '@repo/core/effect/Errors';
import {
  type RejectReason,
  UPLOAD_POLICY,
  type UploadPolicy,
  decideUploadFailure,
} from '@repo/core/logic/sync/uploadDecision';

/**
 * The sync pipe: how a PowerSync database authenticates its download and sends its local changes
 * to the API. It carries any table; what flows through it is decided elsewhere (the sync streams
 * on the way down, the routes on the way up). See the data stack mental model, sections 4 and 5.
 */

/** Sends one local change to the API as a v1 command. The key is stable across retries. */
export type UploadRoute = (
  entry: CrudEntry,
  context: { readonly idempotencyKey: string; readonly signal?: AbortSignal },
) => Promise<void>;
export type UploadRoutes = Readonly<Record<string, UploadRoute>>;

export interface UploadRejection {
  readonly accountId: string;
  readonly table: string;
  readonly op: CrudEntry['op'];
  readonly rowId: string;
  readonly reason: RejectReason;
  readonly error: unknown;
}

export interface SyncPipeOptions {
  readonly accountId: string;
  /** The PowerSync service this account syncs with (configuration, not the grant). */
  readonly endpoint: string;
  /** Asks the API for a signed sync grant. Untrusted until parsed here. */
  readonly fetchGrant: (signal?: AbortSignal) => Promise<unknown>;
  readonly routes: UploadRoutes;
  /** Session, rollout and account admission; checked before every grant and every upload. */
  readonly isAllowed: () => boolean;
  /** The server refused a change for good; it has left the queue. Tell the person. */
  readonly onRejected: (rejection: UploadRejection) => void;
  readonly policy?: UploadPolicy;
  readonly now?: () => number;
  readonly sync?: SyncOptions;
}

export type SyncConnection = SyncOptions & DownloadOptions & UploadOptions;

/** Matches the service's clock tolerance without extending the grant's signed lifetime. */
const GRANT_MAX_LIFETIME_S = 360;

const closed = () => new UnavailableError({ code: 'SYNC_ADMISSION_CLOSED' });

export function createSyncAuthenticator(
  options: Pick<SyncPipeOptions, 'accountId' | 'endpoint' | 'fetchGrant' | 'isAllowed' | 'now'>,
): Authenticator {
  const { accountId, endpoint, fetchGrant, isAllowed, now = Date.now } = options;
  return {
    async resolveCredentials({ abort }) {
      if (!isAllowed()) throw closed();
      const parsed = SyncGrant.safeParse(await fetchGrant(abort));
      if (!parsed.success)
        throw new UnavailableError({ code: 'SYNC_GRANT_INVALID', cause: parsed.error });
      const grant = parsed.data;
      if (!isAllowed()) throw closed();
      if (grant.accountId !== accountId)
        throw new UnauthorizedError({ message: 'Sync grant is for another account' });
      const seconds = Math.floor(now() / 1000);
      if (grant.expiresAt <= seconds || grant.expiresAt > seconds + GRANT_MAX_LIFETIME_S)
        throw new UnavailableError({ code: 'SYNC_GRANT_EXPIRY' });
      assertSecureApiUrl(grant.endpoint);
      if (new URL(grant.endpoint).origin !== new URL(endpoint).origin)
        throw new UnavailableError({ code: 'SYNC_GRANT_ENDPOINT' });
      return grant.token;
    },
  };
}

export function createMutationUploader(
  options: Pick<SyncPipeOptions, 'accountId' | 'routes' | 'isAllowed' | 'onRejected' | 'policy'>,
): MutationUploader {
  const { accountId, routes, isAllowed, onRejected, policy = UPLOAD_POLICY } = options;
  // Failures per queued change, for this connection: only bounds repeated defects.
  const attempts = new Map<number, number>();

  return async ({ database, abort }) => {
    // Unique per installation, so keys never collide after a reinstall restarts `clientId`.
    const installation = await database.getClientId();
    for (;;) {
      if (abort?.aborted || !isAllowed()) return;
      const transaction = await database.getNextCrudTransaction();
      if (!transaction) return;
      for (const entry of transaction.crud) {
        const route = routes[entry.table];
        if (!route)
          throw new UnavailableError({
            code: 'SYNC_ROUTE_NOT_ADMITTED',
            message: `No upload route for ${entry.table}`,
          });
        try {
          await route(entry, {
            idempotencyKey: `powersync:${installation}:${entry.clientId}`,
            signal: abort,
          });
          attempts.delete(entry.clientId);
        } catch (error) {
          const attempt = (attempts.get(entry.clientId) ?? 0) + 1;
          attempts.set(entry.clientId, attempt);
          const decision = decideUploadFailure(error, attempt, policy);
          if (decision._tag === 'Stop') return;
          if (decision._tag === 'Retry') throw error;
          attempts.delete(entry.clientId);
          onRejected({
            accountId,
            table: entry.table,
            op: entry.op,
            rowId: entry.id,
            reason: decision.reason,
            error,
          });
        }
      }
      await transaction.complete();
    }
  };
}

/** Everything `database.connect()` needs, from one set of options. */
export function createSyncConnection(options: SyncPipeOptions): SyncConnection {
  return {
    ...options.sync,
    powerSyncEndpoint: options.endpoint,
    authenticator: createSyncAuthenticator(options),
    upload: createMutationUploader(options),
  };
}
