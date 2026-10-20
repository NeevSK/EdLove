/**
 * The narrow, testable contract for critical foreground startup.
 *
 * Keep optional services out of this coordinator: a failed analytics, sign-in,
 * background-sync, or language setup must not prevent the first app frame.
 */
export interface EssentialStartupDependencies {
  bootstrapPlatform: () => Promise<void>;
  isRuntimeRegistered: () => boolean;
  loadCatalog: () => Promise<{ registerAppCatalog: () => void }>;
  initializeDeviceAccounts: () => Promise<unknown>;
  onStage?: (event: EssentialStartupStageEvent) => void;
  now?: () => number;
}

export type EssentialStartupStage =
  | 'bootstrapPlatform'
  | 'runtimeRegistration'
  | 'loadCatalog'
  | 'registerAppCatalog'
  | 'initializeDeviceAccounts';

export interface EssentialStartupStageEvent {
  stage: EssentialStartupStage;
  outcome: 'complete' | 'failed';
  durationMs: number | null;
}

const ESSENTIAL_STARTUP_TIMEOUT_MS = 200_000;

/**
 * Race a promise against a deadline.
 *
 * When the deadline elapses before `promise` settles, rejects with a
 * labelled timeout error so the caller can surface a retryable failure
 * instead of hanging indefinitely.
 *
 * @param promise - The work being timed.
 * @param ms      - Deadline in milliseconds.
 * @param label   - Human-readable name for the error message.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(
      () =>
        reject(
          new Error(
            `[boot] ${label} timed out after ${ms}ms (connected-mode bridge may still be handshaking)`,
          ),
        ),
      ms,
    );
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  });
}

function readTime(now: () => number): number | null {
  try {
    const value = now();
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

let warnedAboutInstrumentationFailure = false;

function warnAboutInstrumentationFailure(message: string): void {
  if (warnedAboutInstrumentationFailure) return;
  warnedAboutInstrumentationFailure = true;
  try {
    console.warn(message);
  } catch {
    // A console failure cannot become a startup failure.
  }
}

function reportStage(
  onStage: EssentialStartupDependencies['onStage'],
  stage: EssentialStartupStage,
  outcome: EssentialStartupStageEvent['outcome'],
  startedAt: number | null,
  now: () => number,
): void {
  const finishedAt = readTime(now);
  const elapsed = finishedAt === null || startedAt === null ? null : finishedAt - startedAt;
  const durationMs = elapsed === null || !Number.isFinite(elapsed) || elapsed < 0 ? null : elapsed;
  if (durationMs === null) {
    warnAboutInstrumentationFailure('[startup] stage duration could not be measured.');
  }
  try {
    onStage?.({ stage, outcome, durationMs });
  } catch {
    warnAboutInstrumentationFailure('[startup] stage observation callback failed.');
  }
}

async function measureStage<T>(
  stage: EssentialStartupStage,
  onStage: EssentialStartupDependencies['onStage'],
  now: () => number,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = readTime(now);
  try {
    const result = await operation();
    reportStage(onStage, stage, 'complete', startedAt, now);
    return result;
  } catch (cause) {
    reportStage(onStage, stage, 'failed', startedAt, now);
    throw cause;
  }
}

function measureSyncStage<T>(
  stage: EssentialStartupStage,
  onStage: EssentialStartupDependencies['onStage'],
  now: () => number,
  operation: () => T,
): T {
  const startedAt = readTime(now);
  try {
    const result = operation();
    reportStage(onStage, stage, 'complete', startedAt, now);
    return result;
  } catch (cause) {
    reportStage(onStage, stage, 'failed', startedAt, now);
    throw cause;
  }
}

export async function completeEssentialStartup({
  bootstrapPlatform,
  isRuntimeRegistered,
  loadCatalog,
  initializeDeviceAccounts,
  onStage,
  now = () => performance.now(),
}: EssentialStartupDependencies): Promise<void> {
  console.log('[boot trace] 1. Calling bootstrapPlatform()...');
  // The deadline is generous enough for the connected-mode bridge handshake,
  // but every critical stage must eventually surface the retry UI.
  await measureStage('bootstrapPlatform', onStage, now, () =>
    withTimeout(bootstrapPlatform(), ESSENTIAL_STARTUP_TIMEOUT_MS, 'bootstrapPlatform'),
  );
  console.log('[boot trace] 2. bootstrapPlatform() done. Checking isRuntimeRegistered()...');

  measureSyncStage('runtimeRegistration', onStage, now, () => {
    if (!isRuntimeRegistered()) {
      throw new Error('Core runtime registration did not complete.');
    }
  });

  console.log('[boot trace] 3. Loading catalog via dynamic import...');
  const { registerAppCatalog } = await measureStage('loadCatalog', onStage, now, () =>
    withTimeout(loadCatalog(), ESSENTIAL_STARTUP_TIMEOUT_MS, 'loadCatalog'),
  );
  console.log('[boot trace] 4. Catalog loaded. Registering catalog...');
  measureSyncStage('registerAppCatalog', onStage, now, registerAppCatalog);
  console.log('[boot trace] 5. Initializing device account scope...');
  await measureStage('initializeDeviceAccounts', onStage, now, () =>
    withTimeout(
      initializeDeviceAccounts(),
      ESSENTIAL_STARTUP_TIMEOUT_MS,
      'initializeDeviceAccounts',
    ),
  );
  console.log('[boot trace] 6. Essential startup completed successfully!');
}
