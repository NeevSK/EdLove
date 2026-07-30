import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@repo/core/adapters/powersync/powersync-shim';
import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { runEffect, tryPromise } from '@repo/core/utils/effect';
import { getConsistentIdempotencyKey } from '@repo/core/utils/idempotency';
import { Duration, Effect, Schedule } from 'effect';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';

class PowerSyncUploadError {
  readonly _tag = 'PowerSyncUploadError';
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

function fetchSession$(): Effect.Effect<{ access_token: string }, PowerSyncUploadError> {
  return tryPromise(() => __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession()).pipe(
    Effect.mapError((error) => new PowerSyncUploadError(0, error.message)),
    Effect.flatMap(({ data: { session }, error }) =>
      error || !session || session.user?.is_anonymous
        ? Effect.fail(new PowerSyncUploadError(0, 'no_session'))
        : Effect.succeed(session),
    ),
  );
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const session = await runEffect(fetchSession$(), 'POWERSYNC_CREDENTIALS_FAILED');
    return { endpoint: POWERSYNC_URL, token: session.access_token };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    await runEffect(
      Effect.gen(function* () {
        const batch = yield* tryPromise(() => database.getCrudBatch(200));
        if (!batch || batch.crud.length === 0) return;

        const session = yield* fetchSession$().pipe(
          Effect.catchAll(() => Effect.fail(new PowerSyncUploadError(0, 'no_session'))),
        );

        const client = createSovereignClient(SOVEREIGN_API_URL);
        const idempotencyKey = yield* tryPromise(() => getConsistentIdempotencyKey(batch.crud));

        const body = batch.crud.map((c) => ({
          id: c.id,
          op: c.op,
          table: c.table,
          opData: c.opData,
        }));

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

        yield* tryPromise(() => batch.complete());

        const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));
        sovereignBus.emit('powersync:sync_complete', { tablesAffected });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
          }).pipe(Effect.zipRight(Effect.fail(error))),
        ),
      ),
      'POWERSYNC_UPLOAD_FAILED',
    );
  }
}
