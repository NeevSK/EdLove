import { createHash } from 'node:crypto';
import type { Context } from 'hono';

class SyncTableError {
  readonly _tag = 'SyncTableError';
  constructor(readonly table: string) {}
  get message() {
    return `Unsupported sync table: ${this.table}`;
  }
}

class SyncDelegateError {
  readonly _tag = 'SyncDelegateError';
  constructor(readonly modelKey: string) {}
  get message() {
    return `Model delegate "${this.modelKey}" not found in transaction context`;
  }
}

class SyncOperationError {
  readonly _tag = 'SyncOperationError';
  constructor(readonly op: string) {}
  get message() {
    return `Unsupported operations mode: ${this.op}`;
  }
}

const tableToModelMap: Record<string, string> = {
  bonds: 'bond',
  classroom: 'classroom',
  classroom_student: 'classroomStudent',
  classroom_students: 'classroomStudent',
};

type IdempotencyOutcome = {
  success: true;
  processedCount: number;
  idempotent?: boolean;
};

type LocalIdempotencyRecord = IdempotencyOutcome & {
  payloadHash: string;
  timestamp: number;
};

const localIdempotencyCache = new Map<string, LocalIdempotencyRecord>();

// Clean up cache periodically (e.g. keys older than 10 minutes)
if (
  typeof globalThis !== 'undefined' &&
  !(globalThis as any).__powerSyncIdempotencyCleanupInterval
) {
  const interval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, val] of localIdempotencyCache.entries()) {
        if (now - val.timestamp > 10 * 60 * 1000) {
          localIdempotencyCache.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
  if (typeof interval === 'object' && typeof (interval as any).unref === 'function') {
    (interval as any).unref();
  }
  (globalThis as any).__powerSyncIdempotencyCleanupInterval = interval;
}

class IdempotencyConflictError extends Error {
  readonly code = 'IDEMPOTENCY_CONFLICT';
}

const hashCrud = (crud: any[]) => createHash('sha256').update(JSON.stringify(crud)).digest('hex');

export async function applyPowerSyncBatch(
  db: any,
  crud: any[],
  idempotencyKey?: string | null,
  principalId = 'anonymous',
): Promise<IdempotencyOutcome> {
  if (!Array.isArray(crud)) {
    throw new Error('Invalid payload: crud must be an array');
  }

  const payloadHash = hashCrud(crud);
  const scopedKey = `${principalId}:${idempotencyKey ?? ''}`;
  let usedDurableLedger = false;

  console.log(`[Sync] Processing transactional upload batch of ${crud.length} mutations.`);

  try {
    await db.$transaction(async (tx: any) => {
      if (idempotencyKey) {
        if (typeof tx.$executeRaw === 'function' && typeof tx.$queryRaw === 'function') {
          usedDurableLedger = true;
          await tx.$executeRaw`
            INSERT INTO powersync_idempotency_keys (principal_id, idempotency_key, payload_hash, status, processed_count)
            VALUES (${principalId}, ${idempotencyKey}, ${payloadHash}, 'processing', 0)
            ON CONFLICT (principal_id, idempotency_key) DO NOTHING
          `;

          const rows = await tx.$queryRaw`
            SELECT payload_hash, status, processed_count
            FROM powersync_idempotency_keys
            WHERE principal_id = ${principalId} AND idempotency_key = ${idempotencyKey}
            FOR UPDATE
          `;
          const record = rows?.[0];
          if (record?.payload_hash !== payloadHash) {
            throw new IdempotencyConflictError(
              'Idempotency key was reused with a different batch payload',
            );
          }
          if (record?.status === 'completed') {
            throw new IdempotencyReplay(Number(record.processed_count ?? 0));
          }
        } else {
          const cached = localIdempotencyCache.get(scopedKey);
          if (cached) {
            if (cached.payloadHash !== payloadHash) {
              throw new IdempotencyConflictError(
                'Idempotency key was reused with a different batch payload',
              );
            }
            throw new IdempotencyReplay(cached.processedCount);
          }
        }
      }

      for (const item of crud) {
        const { id, op, table, opData } = item;
        const modelKey = tableToModelMap[table] || tableToModelMap[table.toLowerCase()];

        if (!modelKey) {
          console.warn(`[Sync] No active Prisma model mapping for table: "${table}"`);
          throw new SyncTableError(table);
        }

        const delegate = tx[modelKey];
        if (!delegate) {
          throw new SyncDelegateError(modelKey);
        }

        switch (op) {
          case 'PUT':
            await delegate.upsert({
              where: { id },
              create: { ...opData, id },
              update: opData ?? {},
            });
            break;

          case 'PATCH':
            await delegate.update({ where: { id }, data: opData ?? {} });
            break;

          case 'DELETE':
            await delegate.delete({ where: { id } });
            break;

          default:
            throw new SyncOperationError(op);
        }
      }

      if (idempotencyKey && usedDurableLedger) {
        await tx.$executeRaw`
          UPDATE powersync_idempotency_keys
          SET status = 'completed', processed_count = ${crud.length}, completed_at = NOW()
          WHERE principal_id = ${principalId} AND idempotency_key = ${idempotencyKey}
        `;
      }
    });

    if (idempotencyKey) {
      localIdempotencyCache.set(scopedKey, {
        success: true,
        processedCount: crud.length,
        payloadHash,
        timestamp: Date.now(),
      });
    }

    return { success: true, processedCount: crud.length };
  } catch (e) {
    if (e instanceof IdempotencyReplay) {
      return { success: true, processedCount: e.processedCount, idempotent: true };
    }
    const err = e as Error | SyncTableError | SyncDelegateError | SyncOperationError;
    const message =
      err instanceof SyncTableError ||
      err instanceof SyncDelegateError ||
      err instanceof SyncOperationError
        ? err.message
        : err?.message || 'Transaction Aborted';
    console.error('[Sync] Transaction processing failed, batch aborted:', err);
    throw new Error(message, { cause: e });
  }
}

class IdempotencyReplay extends Error {
  constructor(readonly processedCount: number) {
    super('Idempotent replay');
  }
}

/**
 * Sync Domain Handlers
 *
 * Exclusively processes transactional PowerSync batches under
 * ZenStack ReBAC security scopes.
 */
export const syncHandlers = {
  /**
   * Processes a bulk batch of offline mutations.
   * Performs all writes in an atomic transaction under the active user's ReBAC context.
   */
  uploadPowerSyncBatch: async (c: Context) => {
    const db = c.get('db');
    if (!db) {
      return c.json({ error: 'Database context not available' }, 500);
    }

    const idempotencyKey = c.req.header('X-Idempotency-Key');
    try {
      const { crud } = await c.req.json();
      const user = c.get('user') as { id?: string } | undefined;
      const outcome = await applyPowerSyncBatch(db, crud, idempotencyKey, user?.id ?? 'anonymous');
      return c.json(outcome, 200);
    } catch (err: any) {
      return c.json({ error: 'Transaction Aborted', message: err.message }, 400);
    }
  },
};
