import type {
  CommonPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/common';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { SOVEREIGN_API_URL } from '@repo/core/api/base';
import { authenticatedSovereignFetch } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { SyncCredentialsSchema } from '@repo/core/api/syncCredentials';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { runEffect, strictRetryPolicy, tryPromise } from '@repo/core/effect';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { Effect } from 'effect';

class PowerSyncUploadError {
  readonly _tag = 'PowerSyncUploadError';
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

class PowerSyncAccountChangedError extends PowerSyncUploadError {}

function fetchSession$(
  expectedAccountId: string,
  isSyncAllowed: () => boolean,
): Effect.Effect<
  { access_token: string; user_id: string; expires_at?: number },
  PowerSyncUploadError
> {
  return tryPromise(() => supabaseClient.auth.getSession()).pipe(
    Effect.mapError((error) => new PowerSyncUploadError(0, error.message)),
    Effect.flatMap(({ data: { session }, error }) => {
      if (getActiveAccountId() !== expectedAccountId) {
        return Effect.fail(new PowerSyncAccountChangedError(0, 'account_changed'));
      }
      if (!isSyncAllowed())
        return Effect.fail(new PowerSyncUploadError(409, 'sync_admission_closed'));
      return error || !session || !session.user || session.user.is_anonymous
        ? Effect.fail(new PowerSyncUploadError(0, 'no_session'))
        : tryPromise(() => supabaseClient.auth.getClaims(session.access_token)).pipe(
            Effect.mapError((cause) => new PowerSyncUploadError(0, cause.message)),
            Effect.flatMap(({ data, error: claimsError }) => {
              if (getActiveAccountId() !== expectedAccountId) {
                return Effect.fail(new PowerSyncAccountChangedError(0, 'account_changed'));
              }
              if (!isSyncAllowed())
                return Effect.fail(new PowerSyncUploadError(409, 'sync_admission_closed'));
              if (
                claimsError ||
                data?.claims.sub !== session.user.id ||
                data.claims.canonical_account_id !== expectedAccountId
              ) {
                return Effect.fail(
                  new PowerSyncUploadError(401, 'canonical_account_claim_mismatch'),
                );
              }
              return Effect.succeed({
                access_token: session.access_token,
                user_id: expectedAccountId,
                expires_at: session.expires_at,
              });
            }),
          );
    }),
  );
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  constructor(
    private readonly accountId: string,
    private readonly isSyncAllowed: () => boolean,
  ) {}

  private assertSyncAllowed(): void {
    if (!this.isSyncAllowed())
      throw Object.assign(new Error('PowerSync sync admission closed'), { status: 409 });
  }

  async fetchCredentials(): Promise<PowerSyncCredentials> {
    this.assertSyncAllowed();
    const session = await runEffect(
      fetchSession$(this.accountId, this.isSyncAllowed),
      'POWERSYNC_CREDENTIALS_FAILED',
    );
    this.assertSyncAllowed();
    const response = await authenticatedSovereignFetch(
      `${SOVEREIGN_API_URL.replace(/\/+$/, '')}/api/auth/sync-credentials`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      },
      this.accountId,
    );
    if (!response.ok) {
      if (response.body) await response.body.cancel();
      throw new Error(`PowerSync grant admission failed (${response.status})`);
    }
    const parsed = SyncCredentialsSchema.safeParse(await response.json().catch(() => null));
    if (!parsed.success) throw new Error('Invalid PowerSync grant response');
    const grant = parsed.data;
    this.assertSyncAllowed();
    if (getActiveAccountId() !== this.accountId || grant.accountId !== this.accountId) {
      throw new Error('PowerSync account changed during live session admission');
    }
    const now = Math.floor(Date.now() / 1000);
    // Match the service's clock tolerance without extending the signed grant lifetime.
    if (grant.expiresAt <= now || grant.expiresAt > now + 360) {
      throw new Error('Invalid PowerSync grant expiry');
    }
    assertSecureApiUrl(grant.endpoint);
    return {
      endpoint: grant.endpoint,
      token: grant.token,
      expiresAt: new Date(grant.expiresAt * 1000),
    };
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const accountId = this.accountId;
    this.assertSyncAllowed();
    const isSyncAllowed = this.isSyncAllowed;

    return runEffect(
      Effect.gen(function* () {
        const batch = yield* tryPromise(() => database.getCrudBatch(200));
        if (!batch || batch.crud.length === 0) return;

        const session = yield* fetchSession$(accountId, isSyncAllowed);

        const idempotencyKey = yield* tryPromise(() =>
          getConsistentIdempotencyKey(batch.crud, `powersync:${session.user_id}`),
        );

        const body = {
          crud: batch.crud.map((c) => ({
            id: c.id,
            op: c.op,
            table: c.table,
            opData: c.opData,
          })),
          idempotencyKey,
        };

        yield* tryPromise(() => {
          if (!isSyncAllowed())
            throw Object.assign(new Error('PowerSync sync admission closed'), { status: 409 });
          return orpcClient.sync.uploadBatch(
            {
              body,
            },
            {
              expectedAccountId: accountId,
            },
          );
        }).pipe(
          Effect.retry({
            schedule: strictRetryPolicy,
            while: (error: any) => error?.status === 0 || (error?.status && error.status >= 500),
          } as any),
          Effect.catch((e: unknown) => {
            const status = (e as any)?.status || 0;
            const message = (e as any)?.message || String(e);
            return Effect.fail(new PowerSyncUploadError(status, message));
          }),
        );

        if (getActiveAccountId() !== accountId) {
          return yield* Effect.fail(new PowerSyncAccountChangedError(0, 'account_changed'));
        }

        const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));

        yield* tryPromise(() => batch.complete());

        sovereignBus.emit('powersync:sync_complete', { tablesAffected });
      }).pipe(
        Effect.catch((error: Error | PowerSyncUploadError) =>
          Effect.sync(() => {
            sovereignBus.emit('powersync:unavailable', {
              reason:
                error instanceof PowerSyncAccountChangedError
                  ? 'account_switched'
                  : !isSyncAllowed()
                    ? 'disabled'
                    : 'service_down',
            });
          }).pipe(Effect.andThen(Effect.fail(error))),
        ),
      ) as Effect.Effect<void, Error | PowerSyncUploadError, never>,
      'POWERSYNC_UPLOAD_FAILED',
    );
  }
}
