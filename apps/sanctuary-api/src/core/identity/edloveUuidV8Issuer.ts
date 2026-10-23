import { randomBytes } from 'node:crypto';

import {
  type EdloveUuidV8MintOrigin,
  type EdloveUuidV8Subtype,
  encodeEdloveUuidV8,
} from '@repo/core/logic/utils/edloveUuidV8';

const ENTROPY_BYTE_LENGTH = 7;
const DEFAULT_MAX_CLOCK_ROLLBACK_MS = 30_000;

export type EdloveUuidV8IssuerOptions = {
  mintOrigin: EdloveUuidV8MintOrigin;
  now?: () => number;
  entropy?: () => Uint8Array;
  maxClockRollbackMs?: number;
  onClockRollback: (event: {
    observedAtUnixMilliseconds: number;
    retainedAtUnixMilliseconds: number;
  }) => void;
};

export class EdloveUuidV8ClockRollbackError extends Error {
  readonly code = 'EDLOVE_UUID_V8_CLOCK_ROLLBACK_EXCEEDED';

  constructor(readonly driftMilliseconds: number) {
    super('EdLove UUIDv8 issuer clock rollback exceeds the configured safety threshold.');
    this.name = 'EdloveUuidV8ClockRollbackError';
  }
}

function assertFiniteNonNegativeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative safe integer.`);
  }
}

function secureEntropy(): Uint8Array {
  return randomBytes(ENTROPY_BYTE_LENGTH);
}

/**
 * Server-only UUIDv8 issuer. It cannot be used as an authorization primitive
 * and intentionally owns neither persistence nor collision retry.
 */
export function createEdloveUuidV8Issuer(options: EdloveUuidV8IssuerOptions) {
  const mintOrigin = options.mintOrigin;
  const now = options.now ?? Date.now;
  const entropy = options.entropy ?? secureEntropy;
  const maxClockRollbackMs = options.maxClockRollbackMs ?? DEFAULT_MAX_CLOCK_ROLLBACK_MS;
  assertFiniteNonNegativeInteger(maxClockRollbackMs, 'maxClockRollbackMs');

  let lastIssuedAtUnixMilliseconds: number | null = null;

  return {
    issue(subtype: EdloveUuidV8Subtype): string {
      const observedAtUnixMilliseconds = now();
      assertFiniteNonNegativeInteger(observedAtUnixMilliseconds, 'issuer clock value');

      let issuedAtUnixMilliseconds = observedAtUnixMilliseconds;
      if (
        lastIssuedAtUnixMilliseconds !== null &&
        observedAtUnixMilliseconds < lastIssuedAtUnixMilliseconds
      ) {
        const driftMilliseconds = lastIssuedAtUnixMilliseconds - observedAtUnixMilliseconds;
        if (driftMilliseconds > maxClockRollbackMs) {
          throw new EdloveUuidV8ClockRollbackError(driftMilliseconds);
        }
        options.onClockRollback({
          observedAtUnixMilliseconds,
          retainedAtUnixMilliseconds: lastIssuedAtUnixMilliseconds,
        });
        issuedAtUnixMilliseconds = lastIssuedAtUnixMilliseconds;
      }

      const issuedEntropy = entropy();
      if (issuedEntropy.length !== ENTROPY_BYTE_LENGTH) {
        throw new RangeError('EdLove UUIDv8 entropy source must return exactly 56 bits (7 bytes).');
      }

      lastIssuedAtUnixMilliseconds = issuedAtUnixMilliseconds;
      return encodeEdloveUuidV8({
        issuedAtUnixMilliseconds,
        domain: subtype.domain,
        subtype,
        mintOrigin,
        entropy: issuedEntropy,
      });
    },
  };
}
