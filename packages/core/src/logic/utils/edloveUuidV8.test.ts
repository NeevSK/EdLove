import { describe, expect, it } from 'vitest';

import { encodeEdloveUuidV8, isEdloveUuidV8, parseEdloveUuidV8 } from './edloveUuidV8';
import {
  edloveUuidV8ProfileV1AccountVector,
  edloveUuidV8ProfileV1RejectedAccountVectors,
} from './edloveUuidV8ProfileV1Vectors';

describe('EdLove UUIDv8 contract', () => {
  const conformanceParts = {
    issuedAtUnixMilliseconds: edloveUuidV8ProfileV1AccountVector.issuedAtUnixMilliseconds,
    domain: edloveUuidV8ProfileV1AccountVector.domain,
    subtype: edloveUuidV8ProfileV1AccountVector.subtype,
    mintOrigin: edloveUuidV8ProfileV1AccountVector.mintOrigin,
    entropy: Uint8Array.from(edloveUuidV8ProfileV1AccountVector.entropy),
  };

  it('encodes the documented conformance vector', () => {
    expect(encodeEdloveUuidV8(conformanceParts)).toBe(edloveUuidV8ProfileV1AccountVector.uuid);
  });

  it('round-trips registered fields without assigning authorization meaning', () => {
    const parsed = parseEdloveUuidV8(encodeEdloveUuidV8(conformanceParts));

    expect(parsed).toMatchObject({
      issuedAtUnixMilliseconds: conformanceParts.issuedAtUnixMilliseconds,
      domain: edloveUuidV8ProfileV1AccountVector.domain,
      subtype: edloveUuidV8ProfileV1AccountVector.subtype,
      mintOrigin: edloveUuidV8ProfileV1AccountVector.mintOrigin,
    });
    expect(parsed?.entropy).toEqual(conformanceParts.entropy);
  });

  it('rejects an RFC-valid UUID with an unregistered EdLove entity kind', () => {
    expect(isEdloveUuidV8(edloveUuidV8ProfileV1RejectedAccountVectors.unregisteredDomain)).toBe(
      false,
    );
  });

  it('rejects an unregistered subtype and mint origin', () => {
    expect(isEdloveUuidV8(edloveUuidV8ProfileV1RejectedAccountVectors.unregisteredSubtype)).toBe(
      false,
    );
    expect(isEdloveUuidV8(edloveUuidV8ProfileV1RejectedAccountVectors.unregisteredMintOrigin)).toBe(
      false,
    );
  });

  it('rejects a non-v8 UUID', () => {
    expect(isEdloveUuidV8(edloveUuidV8ProfileV1RejectedAccountVectors.wrongVersion)).toBe(false);
  });

  it('rejects a UUID that does not carry the RFC 4122 variant', () => {
    expect(isEdloveUuidV8(edloveUuidV8ProfileV1RejectedAccountVectors.wrongVariant)).toBe(false);
  });

  it('requires exactly seven entropy bytes', () => {
    expect(() => encodeEdloveUuidV8({ ...conformanceParts, entropy: new Uint8Array(6) })).toThrow(
      'entropy must contain exactly 56 bits',
    );
  });

  it('rejects a timestamp that does not fit in 48 bits', () => {
    expect(() =>
      encodeEdloveUuidV8({ ...conformanceParts, issuedAtUnixMilliseconds: 0x1_0000_0000_0000 }),
    ).toThrow('issuedAtUnixMilliseconds must fit in the UUIDv8 48-bit timestamp field');
  });
});
