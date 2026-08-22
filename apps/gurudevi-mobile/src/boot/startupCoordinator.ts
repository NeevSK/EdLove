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
  installWorkflowBridge: () => void;
}

export async function completeEssentialStartup({
  bootstrapPlatform,
  isRuntimeRegistered,
  loadCatalog,
  installWorkflowBridge,
}: EssentialStartupDependencies): Promise<void> {
  await bootstrapPlatform();

  if (!isRuntimeRegistered()) {
    throw new Error('Core runtime registration did not complete.');
  }

  const { registerAppCatalog } = await loadCatalog();
  registerAppCatalog();
  installWorkflowBridge();
}
