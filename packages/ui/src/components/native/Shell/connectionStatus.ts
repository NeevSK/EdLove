/**
 * What the shell says about the connection, in plain words, only while it matters. Offline is
 * normal for many of our people (a school with no signal, data run out), so the words promise
 * that work is kept rather than warn: nothing is lost, it will send. Unknown says nothing.
 */

export type ConnectionTone = 'offline' | 'syncing' | 'attention';
export interface ConnectionStatus {
  tone: ConnectionTone;
  /** The short word for tight places (the sideways rail). */
  short: string;
  /** The full line for the header, also what a screen reader hears. */
  label: string;
}

const saved = (n: number) => (n === 1 ? '1 change' : `${n} changes`);

export function connectionStatusOf({
  network,
  queued,
  syncing,
  failed = 0,
}: {
  network: 'online' | 'offline' | 'unknown';
  /** Changes waiting in the outbox. */
  queued: number;
  syncing: boolean;
  /** Changes that could not be sent and need the person. */
  failed?: number;
}): ConnectionStatus | undefined {
  if (failed > 0)
    return {
      tone: 'attention',
      short: 'Not sent',
      label: `Not sent: ${saved(failed)}, kept on this phone`,
    };
  if (network === 'offline')
    return {
      tone: 'offline',
      short: 'Offline',
      label:
        queued > 0
          ? `Offline. ${saved(queued)} kept, sent when you're back`
          : 'Offline. What you do is kept on this phone',
    };
  if (syncing && queued > 0)
    return { tone: 'syncing', short: 'Sending', label: `Sending ${saved(queued)}` };
  return undefined;
}
