/**
 * Effect vs Async/Await — Side-by-Side Demo
 *
 * Run: npx tsx scripts/effect-vs-async-demo.ts
 *
 * Simulates a flaky attendance API (50% failure rate).
 * Compares: async/await + throw vs Effect + retry + typed errors.
 */
import { Data, Duration, Effect, pipe, Schedule } from 'effect';

// ─── Shared: flaky API sim ───────────────────────────────────────

let callCount = 0;
function flakyAttendanceAPI(studentId: string): Promise<string> {
  callCount++;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve(`attendance-record-${studentId}-${callCount}`);
      } else {
        reject(new Error(`DB_TIMEOUT: connection pool exhausted (call #${callCount})`));
      }
    }, 50);
  });
}

// ─── 1. CONVENTIONAL: async/await + throw ────────────────────────

class APIError extends Error {
  constructor(msg: string, public readonly code: string) {
    super(msg);
    this.name = 'APIError';
  }
}

async function recordAttendanceAsync(studentId: string): Promise<string> {
  try {
    return await flakyAttendanceAPI(studentId);
  } catch (e) {
    throw new APIError(
      `Failed to record attendance for ${studentId}`,
      e instanceof Error ? e.message : 'UNKNOWN',
    );
  }
}

async function runAsync() {
  const results = { success: 0, failure: 0 };
  for (let i = 0; i < 20; i++) {
    try {
      const r = await recordAttendanceAsync(`student-${i}`);
      results.success++;
    } catch (e) {
      results.failure++;
    }
  }
  return results;
}

// ─── 2. EFFECT: typed errors + retry + timeout ───────────────────

class AttendanceError extends Data.TaggedError('AttendanceError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

function recordAttendanceEffect(studentId: string) {
  return Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
      try: () => flakyAttendanceAPI(studentId),
      catch: (e) => new AttendanceError({ message: `Failed for ${studentId}`, cause: e }),
    });
    return result;
  }).pipe(
    Effect.retry(
      pipe(
        Schedule.exponential(Duration.millis(100)),
        Schedule.intersect(Schedule.recurs(4)),
      ),
    ),
    Effect.timeout(Duration.seconds(5)),
  );
}

async function runEffect() {
  const results = { success: 0, failure: 0 };
  for (let i = 0; i < 20; i++) {
    const exit = Effect.runSyncExit(recordAttendanceEffect(`student-${i}`));
    if (exit._tag === 'Success') {
      results.success++;
    } else {
      results.failure++;
    }
  }
  return results;
}

// ─── 3. RUN BOTH ─────────────────────────────────────────────────

async function main() {
  console.log('\n═══ Effect vs Async/Await: Flaky API (50% failure) ═══\n');

  // Async/Await
  callCount = 0;
  const startA = performance.now();
  const asyncResult = await runAsync();
  const timeA = (performance.now() - startA).toFixed(0);

  // Effect
  callCount = 0;
  const startE = performance.now();
  const effectResult = await runEffect();
  const timeE = (performance.now() - startE).toFixed(0);

  console.log('│ Method         │ Success │ Failure │ Time    │');
  console.log('├────────────────┼─────────┼─────────┼─────────┤');
  console.log(
    `│ async/await    │ ${String(asyncResult.success).padStart(7)} │ ${String(asyncResult.failure).padStart(7)} │ ${timeA.padStart(7)}ms │`,
  );
  console.log(
    `│ Effect + retry │ ${String(effectResult.success).padStart(7)} │ ${String(effectResult.failure).padStart(7)} │ ${timeE.padStart(7)}ms │`,
  );
  console.log('└────────────────┴─────────┴─────────┴─────────┘\n');

  // ─── 4. BONUS: Effect error handling is exhaustive ────────────
  console.log('═══ Bonus: Effect catchTag is exhaustive ═══\n');
  const program = recordAttendanceEffect('student-99').pipe(
    Effect.catchTag('AttendanceError', (e) =>
      Effect.succeed(`RECOVERED: ${e.message} — using fallback`),
    ),
  );
  const result = await Effect.runPromise(program);
  console.log(`  Result: ${result}`);
  console.log(
    '  Note: TypeScript compiler tracks each error tag.\n' +
    '  Add a new error type → compiler forces you to handle it.\n' +
    '  try/catch cannot do this.\n',
  );

  // ─── 5. HOW TO USE THIS IN OUR APP ────────────────────────────
  console.log('═══ Integration pattern ────────────────────────────\n');
  console.log('  TanStack Query (UI layer):');
  console.log('    const { data } = useQuery({');
  console.log('      queryKey: ["attendance", id],');
  console.log('      queryFn: () => Effect.runPromise(recordAttendanceEffect(id)),');
  console.log('    });');
  console.log('');
  console.log('  Effect (domain layer):');
  console.log('    Typed errors, retry, DI, fire-and-forget audit.');
  console.log('    Invisible to the UI — it just gets Promise<string>.');
}

main().catch(console.error);
