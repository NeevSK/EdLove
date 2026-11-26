/**
 * How live-session messages travel. `live.ts` decides what is said; a transport only carries
 * it. Three kinds, tried in order, falling back when one is missing or drops:
 *
 * - `internet`: through the API's realtime channel. Assumed first.
 * - `local-network`: the teacher's phone listens on the school Wi-Fi, or on its own hotspot
 *   when there is no router, and devices find it by local discovery (mDNS). Works between
 *   Android and iPhone, and needs no internet. Candidates: `react-native-tcp-socket` with
 *   `react-native-zeroconf`; iOS asks for local network permission.
 * - `nearby`: phone to phone over Bluetooth and Wi-Fi Direct, with no Wi-Fi at all. Candidate:
 *   `expo-nearby-connections` (Google Nearby on Android, Multipeer on iOS). It does **not**
 *   connect Android to iPhone, so it is offered only when the class is all one platform.
 *
 * Nothing here imports a native module. The adapters live in the app, behind `LiveTransport`.
 */

export type TransportKind = 'internet' | 'local-network' | 'nearby';

export type TransportStatus = 'connecting' | 'open' | 'lost' | 'closed';

export interface LiveTransport {
  readonly kind: TransportKind;
  /** Host: start listening. Participant: connect to the host. */
  open(): Promise<void>;
  /** `to` is a participant id, or `all` from the host. Participants always send to the host. */
  send(to: string, data: string): void;
  onMessage(listener: (from: string, data: string) => void): () => void;
  onStatus(listener: (status: TransportStatus) => void): () => void;
  close(): void;
}

export interface TransportAvailability {
  readonly kind: TransportKind;
  readonly usable: boolean;
  /** Why not, in a form the screen can explain: no internet, no permission, Bluetooth off. */
  readonly reason?: 'offline' | 'no-permission' | 'radio-off' | 'unsupported' | 'mixed-platforms';
}

export interface TransportPolicy {
  readonly order: readonly TransportKind[];
  /** How long a lost link may come back on its own before moving to the next kind. */
  readonly graceMs: number;
}

export const DEFAULT_TRANSPORT_POLICY: TransportPolicy = {
  order: ['internet', 'local-network', 'nearby'],
  graceMs: 4000,
};

/** The kinds to try, in policy order, leaving out what can't work right now. */
export function transportsToTry(
  available: readonly TransportAvailability[],
  options: { readonly mixedPlatforms: boolean },
  policy: TransportPolicy = DEFAULT_TRANSPORT_POLICY,
): readonly TransportKind[] {
  const usable = new Map(available.map((a) => [a.kind, a.usable]));
  return policy.order.filter(
    (kind) => usable.get(kind) === true && !(kind === 'nearby' && options.mixedPlatforms),
  );
}

/**
 * What to do when the current link's status changes: stay, or move to the next kind once the
 * grace period has passed without the link coming back.
 */
export function onLinkStatus(
  order: readonly TransportKind[],
  current: TransportKind,
  status: TransportStatus,
  lostForMs: number,
  policy: TransportPolicy = DEFAULT_TRANSPORT_POLICY,
):
  | { readonly action: 'stay' }
  | { readonly action: 'switch'; readonly to: TransportKind }
  | { readonly action: 'give-up' } {
  if (status !== 'lost' || lostForMs < policy.graceMs) return { action: 'stay' };
  const next = order[order.indexOf(current) + 1];
  return next === undefined ? { action: 'give-up' } : { action: 'switch', to: next };
}

/** Longest line a stream transport accepts; live messages are far smaller. */
export const MAX_FRAME_CHARS = 8192;

/** Stream transports (TCP) carry one JSON message per line. */
export const encodeFrame = (message: unknown): string => `${JSON.stringify(message)}\n`;

/**
 * Splits a byte stream back into messages. Chunks can end mid-message; an oversized line is
 * dropped rather than buffered without limit.
 */
export function createFrameReader(): {
  push(chunk: string): readonly unknown[];
} {
  let buffer = '';
  let discarding = false;
  return {
    push(chunk) {
      buffer += chunk;
      const messages: unknown[] = [];
      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (discarding) discarding = false;
        else if (line.length > 0 && line.length <= MAX_FRAME_CHARS) {
          try {
            messages.push(JSON.parse(line));
          } catch {
            // A malformed line is dropped; the session layer resyncs on the next snapshot.
          }
        }
        newline = buffer.indexOf('\n');
      }
      if (buffer.length > MAX_FRAME_CHARS) {
        buffer = '';
        discarding = true;
      }
      return messages;
    },
  };
}
