import type {
  CommonPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/common';
import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { runEffect, tryPromise } from '@repo/core/utils/effect';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Schedule from 'effect/Schedule';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';

class PowerSyncUploadError {
  readonly _tag = 'PowerSyncUploadError';
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

class PowerSyncAccountChangedError extends PowerSyncUploadError {
}

function fetchSession$(
  expectedAccountId: string,
): Effect.Effect<{ access_token: string; user_id: string; expires_at?: number }, PowerSyncUploadError> {
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
    const session = await runEffect(
      fetchSession$(this.accountId),
      'POWERSYNC_CREDENTIALS_FAILED',
    );
    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const accountId = this.accountId;
    const startTime = 0;
    
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

        const startTime = Date.now();
        const uploadCount = batch.crud.length;
        
        yield* tryPromise(() =>
          (client.api as any).powersync.upload.$post(
            { json: body },
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'X-Idempotency-Key': idempotencyKey,
              },
            },
          ),
        ).pipe(
          Effect.flatMap((res: any) => {
            if (!res.ok) {
              return tryPromise(() => res.json()).pipe(
                Effect.flatMap((errorData: any) =>
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
          Effect.retry({
            schedule: Schedule.exponential(Duration.millis(200)),
            times: 2,
          }),
          Effect.catchAll((e) => {
            if (e instanceof PowerSyncUploadError) return Effect.fail(e);
            return Effect.fail(new PowerSyncUploadError(0, String(e)));
          }),
        );

        const latencyMs = Date.now() - startTime;
        const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));
        
        yield* tryPromise(() => batch.complete());

        sovereignBus.emit('powersync:sync_complete', { tablesAffected });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            const isAccountChanged = error instanceof PowerSyncAccountChangedError;
            sovereignBus.emit('powersync:unavailable', {
              reason: error instanceof PowerSyncAccountChangedError ? 'account_switched' : 'service_down',
            });
          }).pipe(Effect.zipRight(Effect.fail(error))),
        ),
      ),
      'POWERSYNC_UPLOAD_FAILED',
    );
  }
}
