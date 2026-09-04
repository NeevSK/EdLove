import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Queue from 'effect/Queue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DatabaseQueryError,
  NetworkError,
  OfflineMutationError,
  SyncDelegateError,
  SyncOperationError,
  SyncTableError,
  UnauthorizedError,
  defaultRetryPolicy,
  fireAndForget,
  fireAndForgetEffect,
  fromSupabase,
  normalizeError,
  retryPolicy,
  runEffect,
  strictRetryPolicy,
  tryPromise,
} from '../index';
import { applyPowerSyncBatch } from '../../api/handlers/sync';
import * as monitoring from '../../monitoring';

vi.mock('../../monitoring', () => ({
  captureException: vi.fn(),
}));

describe('Effect-TS Production Resilience & Load-Breaking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════════════════════
  // 1. SCHEDULE & RETRY PHYSICS
  // ═════════════════════════════════════════════════════════════════════
  describe('Schedule & Retry Physics', () => {
    it('strictRetryPolicy limits attempts to exactly 3 (1 initial + 2 retries)', async () => {
      let attempts = 0;
      const failingOp = Effect.sync(() => {
        attempts += 1;
      }).pipe(
        Effect.flatMap(() => Effect.fail(new Error('transient 503'))),
        Effect.retry(strictRetryPolicy),
      );

      const exit = await Effect.runPromiseExit(failingOp);

      expect(exit._tag).toBe('Failure');
      expect(attempts).toBe(3); // Initial attempt + 2 recurs = 3 total
    });

    it('defaultRetryPolicy limits attempts to exactly 4 (1 initial + 3 retries)', async () => {
      let attempts = 0;
      const failingOp = Effect.sync(() => {
        attempts += 1;
      }).pipe(
        Effect.flatMap(() => Effect.fail(new Error('transient network drop'))),
        Effect.retry(defaultRetryPolicy),
      );

      const exit = await Effect.runPromiseExit(failingOp);

      expect(exit._tag).toBe('Failure');
      expect(attempts).toBe(4); // Initial attempt + 3 recurs = 4 total
    });

    it('retryPolicy(n) respects custom bounds (n = 1 and n = 0)', async () => {
      let attemptsN1 = 0;
      const opN1 = Effect.sync(() => {
        attemptsN1 += 1;
      }).pipe(
        Effect.flatMap(() => Effect.fail(new Error('fail'))),
        Effect.retry(retryPolicy(1)),
      );
      await Effect.runPromiseExit(opN1);
      expect(attemptsN1).toBe(2); // 1 initial + 1 retry

      let attemptsN0 = 0;
      const opN0 = Effect.sync(() => {
        attemptsN0 += 1;
      }).pipe(
        Effect.flatMap(() => Effect.fail(new Error('fail'))),
        Effect.retry(retryPolicy(0)),
      );
      await Effect.runPromiseExit(opN0);
      expect(attemptsN0).toBe(1); // 1 initial + 0 retries
    });

    it('recovers immediately without executing unnecessary retries when succeeding on attempt 2', async () => {
      let attempts = 0;
      const flakyOp = Effect.try({
        try: () => {
          attempts += 1;
          if (attempts < 2) {
            throw new Error('first attempt failed');
          }
          return 'recovered-data';
        },
        catch: (e) => e as Error,
      }).pipe(Effect.retry(defaultRetryPolicy));

      const result = await Effect.runPromise(flakyOp);

      expect(result).toBe('recovered-data');
      expect(attempts).toBe(2);
    });

    it('cleans up fiber immediately when cancelled during retry backoff sleep', async () => {
      let attempts = 0;
      const longBackoff = Effect.sync(() => {
        attempts += 1;
      }).pipe(
        Effect.flatMap(() => Effect.fail(new Error('fail'))),
        Effect.retry(defaultRetryPolicy),
      );

      const fiber = Effect.runFork(longBackoff);
      // Interrupt fiber while it is sleeping between retries
      await new Promise((r) => setTimeout(r, 50));
      await Effect.runPromise(Fiber.interrupt(fiber));

      const priorAttempts = attempts;
      // Wait past the first backoff duration (200ms) to ensure no rogue retries run
      await new Promise((r) => setTimeout(r, 250));
      expect(attempts).toBe(priorAttempts);
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 2. DEFECT & PANIC ISOLATION (RUNNER BOUNDARY)
  // ═════════════════════════════════════════════════════════════════════
  describe('Defect & Panic Isolation at Runtime Boundary', () => {
    it('catches synchronous unhandled Defects (panics) and converts to APIError', async () => {
      const explodingEffect = Effect.sync(() => {
        const nullRef: any = null;
        return nullRef.nonExistentField(); // Throws TypeError: Cannot read properties of null
      });

      await expect(runEffect(explodingEffect, 'PANIC_DEREF')).rejects.toThrow();

      expect(monitoring.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          operation: 'PANIC_DEREF',
          boundary: 'effect-defect',
        }),
      );
    });

    it('catches Effect.die defects and prevents host process crash', async () => {
      const dyingEffect = Effect.die(new Error('Fatal internal invariant violated'));

      await expect(runEffect(dyingEffect, 'INVARIANT_VIOLATION')).rejects.toThrow(
        'Fatal internal invariant violated',
      );

      expect(monitoring.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          operation: 'INVARIANT_VIOLATION',
          boundary: 'effect-defect',
        }),
      );
    });

    it('normalizes non-Error rejections (strings, numbers, objects) safely into Error instances', () => {
      const errFromString = normalizeError('Network gateway timeout');
      expect(errFromString).toBeInstanceOf(Error);
      expect(errFromString.message).toBe('Network gateway timeout');

      const errFromObj = normalizeError({ status: 502, reason: 'Bad Gateway' });
      expect(errFromObj).toBeInstanceOf(Error);
      expect(errFromObj.message).toContain('Bad Gateway');

      const errFromNull = normalizeError(null);
      expect(errFromNull).toBeInstanceOf(Error);
      expect(errFromNull.message).toBe('null');
    });

    it('safely wraps async promise rejections with non-Error payloads', async () => {
      const weirdPromise = tryPromise(async () => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject('Plain string rejection from legacy library');
      });

      const exit = await Effect.runPromiseExit(weirdPromise);
      expect(exit._tag).toBe('Failure');
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 3. FIRE-AND-FORGET FIBER SUPERVISION & CRASH RESILIENCE
  // ═════════════════════════════════════════════════════════════════════
  describe('Fire-and-Forget Supervision & Isolation', () => {
    it('ensures child fiber rejection does not throw or disturb the parent caller', async () => {
      let callerFinished = false;

      fireAndForget(async () => {
        throw new Error('Background audit telemetry server unreachable');
      }, 'AuditLogService');

      callerFinished = true;
      expect(callerFinished).toBe(true);

      // Yield event loop to let detached fiber settle
      await new Promise((r) => setTimeout(r, 60));

      expect(monitoring.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          operation: 'AuditLogService',
          boundary: 'fire-and-forget',
        }),
      );
    });

    it('ensures child fiber unhandled Defect does not crash host runtime', async () => {
      fireAndForgetEffect(
        Effect.sync(() => {
          throw new RangeError('Maximum call stack size exceeded simulation');
        }),
        'DangerousBackgroundJob',
      );

      await new Promise((r) => setTimeout(r, 60));

      expect(monitoring.captureException).toHaveBeenCalledWith(
        expect.any(RangeError),
        expect.objectContaining({
          operation: 'DangerousBackgroundJob',
          boundary: 'fire-and-forget-defect',
        }),
      );
    });

    it('executes multiple concurrent background fibers independently without interference', async () => {
      const executed: string[] = [];

      fireAndForget(async () => {
        await new Promise((r) => setTimeout(r, 20));
        executed.push('job-A');
      }, 'JobA');

      fireAndForget(async () => {
        throw new Error('Job B failed immediately');
      }, 'JobB');

      fireAndForget(async () => {
        await new Promise((r) => setTimeout(r, 40));
        executed.push('job-C');
      }, 'JobC');

      await new Promise((r) => setTimeout(r, 80));

      // Job A and Job C must succeed despite Job B failing
      expect(executed).toContain('job-A');
      expect(executed).toContain('job-C');
      expect(monitoring.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ operation: 'JobB' }),
      );
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 4. SUPABASE ADAPTER BOUNDARY CONTRACT
  // ═════════════════════════════════════════════════════════════════════
  describe('fromSupabase Boundary Contract', () => {
    it('converts Supabase structured error objects into typed failures without leaking nulls', async () => {
      const queryMock = vi.fn(async () => ({
        data: null,
        error: { message: 'relation "students" does not exist', code: '42P01' },
      }));

      const op = fromSupabase(queryMock, 'fetchStudents');
      const exit = await Effect.runPromiseExit(op);

      expect(exit._tag).toBe('Failure');
      await expect(Effect.runPromise(op)).rejects.toThrow('relation "students" does not exist');
    });

    it('converts null data with null error into a labelled failure', async () => {
      const queryMock = vi.fn(async () => ({ data: null, error: null }));
      const op = fromSupabase(queryMock, 'fetchUserProfile');

      await expect(Effect.runPromise(op)).rejects.toThrow('fetchUserProfile returned null');
    });

    it('catches network level transport throws during query execution', async () => {
      const queryMock = vi.fn(async () => {
        throw new TypeError('Failed to fetch: net::ERR_NAME_NOT_RESOLVED');
      });

      const op = fromSupabase(queryMock, 'dnsFailingQuery');
      await expect(Effect.runPromise(op)).rejects.toThrow('net::ERR_NAME_NOT_RESOLVED');
    });

    it('unwraps valid non-null payloads intact', async () => {
      const expectedRecord = { id: 'uuid-123', name: 'Devi Academy' };
      const queryMock = vi.fn(async () => ({ data: expectedRecord, error: null }));

      const op = fromSupabase(queryMock, 'getSchool');
      const result = await Effect.runPromise(op);

      expect(result).toEqual(expectedRecord);
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 5. TAGGED DOMAIN ERRORS & POLYMORPHISM
  // ═════════════════════════════════════════════════════════════════════
  describe('Canonical Tagged Errors & Polymorphic Matching', () => {
    it('SyncTableError carries deterministic tag and informative message', () => {
      const err = new SyncTableError({ table: 'unregistered_entity' });
      expect(err._tag).toBe('SyncTableError');
      expect(err.message).toBe('Unsupported sync table: unregistered_entity');
      expect(err.table).toBe('unregistered_entity');
    });

    it('SyncDelegateError carries deterministic tag and message', () => {
      const err = new SyncDelegateError({ modelKey: 'ghostModel' });
      expect(err._tag).toBe('SyncDelegateError');
      expect(err.message).toBe('Model delegate "ghostModel" not found in transaction context');
      expect(err.modelKey).toBe('ghostModel');
    });

    it('SyncOperationError carries deterministic tag and message', () => {
      const err = new SyncOperationError({ op: 'PURGE_ALL' });
      expect(err._tag).toBe('SyncOperationError');
      expect(err.message).toBe('Unsupported operations mode: PURGE_ALL');
      expect(err.op).toBe('PURGE_ALL');
    });

    it('OfflineMutationError formats with operation label when provided', () => {
      const errWithOp = new OfflineMutationError({ cause: 'timeout', operation: 'syncGrades' });
      expect(errWithOp._tag).toBe('OfflineMutationError');
      expect(errWithOp.message).toBe('Offline mutation failed for operation: syncGrades');

      const errWithoutOp = new OfflineMutationError({ cause: 'unknown' });
      expect(errWithoutOp.message).toBe('Offline mutation failed');
    });

    it('enables compiler-checked exhaustive catchTag pattern matching on unions', async () => {
      type DomainUnion = SyncTableError | SyncDelegateError | UnauthorizedError;

      const runWithMatching = (err: DomainUnion) =>
        Effect.fail(err).pipe(
          Effect.catchTag('SyncTableError', (e) => Effect.succeed(`handled-table:${e.table}`)),
          Effect.catchTag('SyncDelegateError', (e) =>
            Effect.succeed(`handled-delegate:${e.modelKey}`),
          ),
          Effect.catchTag('UnauthorizedError', () => Effect.succeed('handled-unauthorized')),
        );

      const res1 = await Effect.runPromise(runWithMatching(new SyncTableError({ table: 'bonds' })));
      expect(res1).toBe('handled-table:bonds');

      const res2 = await Effect.runPromise(
        runWithMatching(new SyncDelegateError({ modelKey: 'classroom' })),
      );
      expect(res2).toBe('handled-delegate:classroom');

      const res3 = await Effect.runPromise(runWithMatching(new UnauthorizedError({})));
      expect(res3).toBe('handled-unauthorized');
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 6. ASYNC QUEUE CONCURRENCY & WORKER FIBER SURVIVAL (POISON PILL)
  // ═════════════════════════════════════════════════════════════════════
  describe('Queue Concurrency & Worker Survival', () => {
    it('survives an unhandled poison pill exception without killing the consumer worker', async () => {
      const executed: number[] = [];
      const queue = Effect.runSync(Queue.unbounded<() => Promise<unknown>>());

      // Worker fiber mimicking the lazy getAuditQueue pattern with error shield
      const workerFiber = Effect.runFork(
        Queue.take(queue).pipe(
          Effect.flatMap((task) =>
            Effect.tryPromise({ try: task, catch: (e) => e as Error }).pipe(
              Effect.catchAll((err) =>
                Effect.sync(() => {
                  monitoring.captureException(err, { boundary: 'queue-test' });
                }),
              ),
              Effect.catchAllDefect((defect) =>
                Effect.sync(() => {
                  monitoring.captureException(defect, { boundary: 'queue-defect-test' });
                }),
              ),
            ),
          ),
          Effect.forever,
        ),
      );

      // Task 1: Normal task
      Effect.runSync(
        Queue.offer(queue, async () => {
          executed.push(1);
        }),
      );

      // Task 2: POISON PILL (throws unhandled synchronous defect)
      Effect.runSync(
        Queue.offer(queue, () => {
          throw new TypeError('Poison pill fatal defect');
        }),
      );

      // Task 3: Normal task — MUST STILL EXECUTE!
      Effect.runSync(
        Queue.offer(queue, async () => {
          executed.push(3);
        }),
      );

      // Task 4: Normal task
      Effect.runSync(
        Queue.offer(queue, async () => {
          executed.push(4);
        }),
      );

      // Wait for queue drain
      await new Promise((r) => setTimeout(r, 100));

      expect(executed).toEqual([1, 3, 4]);
      expect(monitoring.captureException).toHaveBeenCalled();

      // Clean up worker
      await Effect.runPromise(Fiber.interrupt(workerFiber));
    });

    it('guarantees strict FIFO processing order for concurrent enqueue bursts', async () => {
      const processed: number[] = [];
      const queue = Effect.runSync(Queue.unbounded<number>());

      const workerFiber = Effect.runFork(
        Queue.take(queue).pipe(
          Effect.flatMap((val) =>
            Effect.sync(() => {
              processed.push(val);
            }),
          ),
          Effect.forever,
        ),
      );

      // Burst enqueue 50 items concurrently
      const items = Array.from({ length: 50 }, (_, i) => i);
      Effect.runSync(Queue.offerAll(queue, items));

      await new Promise((r) => setTimeout(r, 80));

      expect(processed).toEqual(items);
      expect(processed.length).toBe(50);

      await Effect.runPromise(Fiber.interrupt(workerFiber));
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // 7. POWERSYNC BATCH ATOMICITY UNDER POISON PILLS
  // ═════════════════════════════════════════════════════════════════════
  describe('applyPowerSyncBatch Poison Pill & Transaction Atomicity', () => {
    it('aborts entire batch atomically when an unsupported table appears mid-batch', async () => {
      let rolledBack = false;
      const appliedOps: string[] = [];

      const mockTx: any = {
        classroom: {
          upsert: vi.fn(async () => {
            appliedOps.push('classroom_1');
          }),
        },
      };

      const mockDb = {
        $transaction: async (fn: (tx: any) => Promise<any>) => {
          try {
            return await fn(mockTx);
          } catch (err) {
            rolledBack = true;
            throw err;
          }
        },
      };

      const crudBatch = [
        { id: '1', op: 'PUT', table: 'classroom', opData: { name: 'Grade 10' } },
        { id: '2', op: 'PUT', table: 'INVALID_POISON_TABLE', opData: {} }, // POISON PILL
      ];

      await expect(
        applyPowerSyncBatch(mockDb, crudBatch, 'key-1', 'principal-1'),
      ).rejects.toThrow('Unsupported sync table: INVALID_POISON_TABLE');

      expect(rolledBack).toBe(true);
    });

    it('aborts entire batch atomically when an unsupported operation mode appears', async () => {
      let rolledBack = false;
      const mockTx: any = {
        bond: { upsert: vi.fn() },
      };

      const mockDb = {
        $transaction: async (fn: (tx: any) => Promise<any>) => {
          try {
            return await fn(mockTx);
          } catch (err) {
            rolledBack = true;
            throw err;
          }
        },
      };

      const crudBatch = [
        { id: '1', op: 'TRUNCATE_ILLEGAL_OP', table: 'bonds', opData: {} }, // POISON PILL
      ];

      await expect(
        applyPowerSyncBatch(mockDb, crudBatch, 'key-2', 'principal-1'),
      ).rejects.toThrow('Unsupported operations mode: TRUNCATE_ILLEGAL_OP');

      expect(rolledBack).toBe(true);
    });

    it('rejects batch payload that is not an array', async () => {
      const mockDb = { $transaction: vi.fn() };
      await expect(
        applyPowerSyncBatch(mockDb, 'not-an-array' as any, 'key-3', 'principal-1'),
      ).rejects.toThrow('Invalid payload: crud must be an array');
    });
  });
});
