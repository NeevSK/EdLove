import {
  edloveUuidV8MintOrigin,
  edloveUuidV8Subtype,
  parseEdloveUuidV8,
} from '@repo/core/logic/utils/edloveUuidV8';
import { edloveUuidV8ProfileV1AccountVector } from '@repo/core/logic/utils/edloveUuidV8ProfileV1Vectors';
import { describe, expect, it, vi } from 'vitest';

import {
  createEdloveUuidV8Issuer,
  EdloveUuidV8ClockRollbackError,
} from '../core/identity/edloveUuidV8Issuer';

describe('EdLove UUIDv8 server issuer', () => {
  it('uses injected CSPRNG output and emits the canonical account shape', () => {
    const issuer = createEdloveUuidV8Issuer({
      mintOrigin: edloveUuidV8MintOrigin.centralProduction,
      now: () => edloveUuidV8ProfileV1AccountVector.issuedAtUnixMilliseconds,
      entropy: () => Uint8Array.from(edloveUuidV8ProfileV1AccountVector.entropy),
      onClockRollback: vi.fn(),
    });

    expect(issuer.issue(edloveUuidV8Subtype.account)).toBe(edloveUuidV8ProfileV1AccountVector.uuid);
  });

  it('retains the last timestamp for a bounded rollback and reports it', () => {
    const now = vi.fn().mockReturnValueOnce(1_000).mockReturnValueOnce(990);
    const onClockRollback = vi.fn();
    const issuer = createEdloveUuidV8Issuer({
      mintOrigin: edloveUuidV8MintOrigin.centralProduction,
      now,
      entropy: () => new Uint8Array(7),
      onClockRollback,
      maxClockRollbackMs: 20,
    });

    issuer.issue(edloveUuidV8Subtype.account);
    const parsed = parseEdloveUuidV8(issuer.issue(edloveUuidV8Subtype.account));

    expect(parsed?.issuedAtUnixMilliseconds).toBe(1_000);
    expect(onClockRollback).toHaveBeenCalledWith({
      observedAtUnixMilliseconds: 990,
      retainedAtUnixMilliseconds: 1_000,
    });
  });

  it('fails closed before requesting entropy when rollback exceeds its threshold', () => {
    const now = vi.fn().mockReturnValueOnce(1_000).mockReturnValueOnce(900);
    const entropy = vi.fn(() => new Uint8Array(7));
    const issuer = createEdloveUuidV8Issuer({
      mintOrigin: edloveUuidV8MintOrigin.centralProduction,
      now,
      entropy,
      onClockRollback: vi.fn(),
      maxClockRollbackMs: 20,
    });

    issuer.issue(edloveUuidV8Subtype.account);

    expect(() => issuer.issue(edloveUuidV8Subtype.account)).toThrow(EdloveUuidV8ClockRollbackError);
    expect(entropy).toHaveBeenCalledTimes(1);
  });

  it('rejects a faulty entropy source without a weak fallback', () => {
    const issuer = createEdloveUuidV8Issuer({
      mintOrigin: edloveUuidV8MintOrigin.centralProduction,
      now: () => 1_000,
      entropy: () => new Uint8Array(6),
      onClockRollback: vi.fn(),
    });

    expect(() => issuer.issue(edloveUuidV8Subtype.account)).toThrow(
      'entropy source must return exactly 56 bits',
    );
  });

  it('propagates an entropy-source failure without issuing an alternative identifier', () => {
    const issuer = createEdloveUuidV8Issuer({
      mintOrigin: edloveUuidV8MintOrigin.centralProduction,
      now: () => 1_000,
      entropy: () => {
        throw new Error('entropy source unavailable');
      },
      onClockRollback: vi.fn(),
    });

    expect(() => issuer.issue(edloveUuidV8Subtype.account)).toThrow('entropy source unavailable');
  });

  it('supports a non-production server mint origin only when explicitly configured', () => {
    const issuer = createEdloveUuidV8Issuer({
      now: () => 1_000,
      entropy: () => new Uint8Array(7),
      onClockRollback: vi.fn(),
      mintOrigin: edloveUuidV8MintOrigin.nonProduction,
    });

    expect(parseEdloveUuidV8(issuer.issue(edloveUuidV8Subtype.account))?.mintOrigin).toBe(
      edloveUuidV8MintOrigin.nonProduction,
    );
  });
});
