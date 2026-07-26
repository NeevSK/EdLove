import { Duration, Effect, Schedule } from 'effect';
import { createSovereignClient, SOVEREIGN_API_URL } from '@/api/base';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { sovereignBus } from '@/lib/sync/eventBus';
import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@/adapters/powersync/powersync-shim';
import { getConsistentIdempotencyKey } from '@/utils/idempotency';

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';

class PowerSyncUploadError {
  readonly _tag = 'PowerSyncUploadError';
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

function fetchSession$(): Effect.Effect<{ access_token: string }, PowerSyncUploadError> {
  return Effect.promise(() => __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession()).pipe(
    Effect.flatMap(({ data: { session }, error }) =>
      error || !session
        ? Effect.fail(new PowerSyncUploadError(0, 'no_session'))
        : Effect.succeed(session),
    ),
  );
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const session = await Effect.runPromise(fetchSession$());
    return { endpoint: POWERSYNC_URL, token: session.access_token };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    await Effect.runPromise(
      Effect.gen(function* () {
        const batch = yield* Effect.promise(() => database.getCrudBatch(200));
        if (!batch || batch.crud.length === 0) return;

        const session = yield* fetchSession$().pipe(
          Effect.catchAll(() => Effect.fail(new PowerSyncUploadError(0, 'no_session'))),
        );

        const client = createSovereignClient(SOVEREIGN_API_URL);
        const idempotencyKey = yield* Effect.promise(() =>
          getConsistentIdempotencyKey(batch.crud),
        );

        const body = batch.crud.map((c) => ({
          id: c.id,
          op: c.op,
          table: c.table,
          opData: c.opData,
        }));

        yield* Effect.promise(() =>
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
              return Effect.promise(() => res.json()).pipe(
                Effect.flatMap((errorData: any) =>
                  Effect.fail(
                    new PowerSyncUploadError(
                      res.status,
                      errorData?.message ||
                        `Sanctuary API sync failed with status ${res.status}`,
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

        yield* Effect.promise(() => batch.complete());

        const tablesAffected = Array.from(new Set(batch.crud.map((c) => c.table)));
        sovereignBus.emit('powersync:sync_complete', { tablesAffected });
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            if (e instanceof PowerSyncUploadError) {
              sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
            }
          }),
        ),
      ),
    );
  }
}
