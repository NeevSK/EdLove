import type {
  CommonPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/common';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { runEffect, strictRetryPolicy, tryPromise } from '@repo/core/effect';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { Effect } from 'effect';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';

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
      return error || !session || !session.user || session.user.is_anonymous
        ? Effect.fail(new PowerSyncUploadError(0, 'no_session'))
        : Effect.succeed({
            access_token: session.access_token,
            user_id: session.user.id,
            expires_at: session.expires_at,
          });
    }),
  );
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  constructor(private readonly accountId: string) {}

  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const session = await runEffect(fetchSession$(this.accountId), 'POWERSYNC_CREDENTIALS_FAILED');
    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const accountId = this.accountId;

    return runEffect(
      Effect.gen(function* () {
        const batch = yield* tryPromise(() => database.getCrudBatch(200));
        if (!batch || batch.crud.length === 0) return;

        const session = yield* fetchSession$(accountId);

        const client = createSovereignClient(SOVEREIGN_API_URL);
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
          const api = client.api as unknown as {
            powersync: {
              upload: {
                $post: (
                  req: { json: typeof body },
                  options: { headers: Record<string, string> },
                ) => Promise<Response>;
              };
            };
          };
          return api.powersync.upload.$post(
            { json: body },
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'X-Idempotency-Key': idempotencyKey,
              },
            },
          );
        }).pipe(
          Effect.flatMap((res) => {
            if (!res.ok) {
              return tryPromise(() => res.json() as Promise<{ message?: string }>).pipe(
                Effect.flatMap((errorData) =>
                  Effect.fail(
                    new PowerSyncUploadError(
                      res.status,
                      errorData?.message || `Sanctuary API sync failed with status ${res.status}`,
                    ),
                  ),
                ),
              );
            }
            return Effect.void;
          }),
          Effect.retry(strictRetryPolicy),
          Effect.catch((e: unknown) => {
            if (e instanceof PowerSyncUploadError) return Effect.fail(e);
            return Effect.fail(new PowerSyncUploadError(0, String(e)));
          }),
        );

        const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));

        yield* tryPromise(() => batch.complete());

        sovereignBus.emit('powersync:sync_complete', { tablesAffected });
      }).pipe(
        Effect.catch((error: Error | PowerSyncUploadError) =>
          Effect.sync(() => {
            sovereignBus.emit('powersync:unavailable', {
              reason:
                error instanceof PowerSyncAccountChangedError ? 'account_switched' : 'service_down',
            });
          }).pipe(Effect.andThen(Effect.fail(error))),
        ),
      ),
      'POWERSYNC_UPLOAD_FAILED',
    );
  }
}
