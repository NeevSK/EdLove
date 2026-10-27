type ReplayLease = {
  settled: Promise<void>;
  release: () => void;
};

const closedPrincipals = new Set<string>();
const activeLeases = new Map<string, Set<ReplayLease>>();
const listeners = new Set<() => void>();

export function subscribeReplayAdmission(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isReplayAdmissionOpen(principalId: string): boolean {
  return !closedPrincipals.has(principalId);
}

export interface ReplayAdmissionLease {
  release(): void;
}

/** Claims permission to start one principal-owned outbox handler. */
export function tryBeginReplay(principalId: string): ReplayAdmissionLease | null {
  if (closedPrincipals.has(principalId)) return null;

  let settle!: () => void;
  const settled = new Promise<void>((resolve) => {
    settle = resolve;
  });
  let released = false;
  const lease: ReplayLease = {
    settled,
    release: () => {
      if (released) return;
      released = true;
      const leases = activeLeases.get(principalId);
      leases?.delete(lease);
      if (leases?.size === 0) activeLeases.delete(principalId);
      settle();
    },
  };

  const leases = activeLeases.get(principalId) ?? new Set<ReplayLease>();
  leases.add(lease);
  activeLeases.set(principalId, leases);
  return lease;
}

/** Closes admission before waiting, so the wait set cannot grow. */
export async function closeReplayAdmission(principalId: string, timeoutMs = 30_000): Promise<void> {
  const changed = !closedPrincipals.has(principalId);
  closedPrincipals.add(principalId);
  if (changed) for (const listener of listeners) listener();
  const pending = [...(activeLeases.get(principalId) ?? [])].map((lease) => lease.settled);
  if (pending.length === 0) return;

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all(pending),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Timed out waiting for ${principalId} replay to settle.`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

/** Reopens a principal only after its account and session are ready to replay. */
export function openReplayAdmission(principalId: string): void {
  if (closedPrincipals.delete(principalId)) for (const listener of listeners) listener();
}
