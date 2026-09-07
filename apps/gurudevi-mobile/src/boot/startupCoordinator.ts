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
}

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
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[boot] ${label} timed out after ${ms}ms (connected-mode bridge may still be handshaking)`)),
        ms,
      )
    ),
  ]);
}

export async function completeEssentialStartup({
  bootstrapPlatform,
  isRuntimeRegistered,
  loadCatalog,
  initializeDeviceAccounts,
}: EssentialStartupDependencies): Promise<void> {
  console.log('[boot trace] 1. Calling bootstrapPlatform()...');
  // 10 s deadline — generous enough for Argent / agent-device connected-mode
  // bridge handshake, but converts an infinite stall into a retryable failure.
  await withTimeout(bootstrapPlatform(), 10_000, 'bootstrapPlatform');
  console.log('[boot trace] 2. bootstrapPlatform() done. Checking isRuntimeRegistered()...');

  if (!isRuntimeRegistered()) {
    throw new Error('Core runtime registration did not complete.');
  }

  console.log('[boot trace] 3. Loading catalog via dynamic import...');
  const { registerAppCatalog } = await loadCatalog();
  console.log('[boot trace] 4. Catalog loaded. Registering catalog...');
  registerAppCatalog();
  console.log('[boot trace] 5. Initializing device account scope...');
  await initializeDeviceAccounts();
  console.log('[boot trace] 6. Essential startup completed successfully!');
}
