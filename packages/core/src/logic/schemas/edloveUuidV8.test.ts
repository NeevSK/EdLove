import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  encodeEdloveUuidV8,
  isEdloveAccountId,
  isEdloveUuidV8,
  parseEdloveUuidV8,
} from './edloveUuidV8';
import {
  edloveUuidV8ProfileV1AccountVector,
  edloveUuidV8ProfileV1RejectedAccountVectors,
} from './edloveUuidV8ProfileV1Vectors';

const crossRuntimeFixturePath = new URL(
  '../../../../../apps/gurudevi-mobile/supabase/tests/fixtures/edlove_uuid_v8_profile_v1_vectors.sql',
  import.meta.url,
);

describe('canonical EdLove account IDs', () => {
  it('accepts the cross-language account vector and rejects every registered negative vector', () => {
    expect(isEdloveAccountId(edloveUuidV8ProfileV1AccountVector.uuid)).toBe(true);
    for (const candidate of Object.values(edloveUuidV8ProfileV1RejectedAccountVectors)) {
      expect(isEdloveAccountId(candidate)).toBe(false);
    }
    expect(isEdloveAccountId('123e4567-e89b-42d3-a456-426614174020')).toBe(false);
  });
});

function readCrossRuntimeVectors(): ReadonlyMap<string, { candidate: string; expected: boolean }> {
  const source = readFileSync(crossRuntimeFixturePath, 'utf8');
  const matches = source.matchAll(/\('([^']+)', '([0-9a-f-]+)', (true|false)\)/g);
  const vectors = new Map<string, { candidate: string; expected: boolean }>();
  for (const match of matches) {
    const [, name, candidate, expected] = match;
    if (!name || !candidate || !expected)
      throw new Error('Malformed UUIDv8 cross-runtime fixture.');
    vectors.set(name, { candidate, expected: expected === 'true' });
  }
  return vectors;
}

describe('EdLove UUIDv8 contract', () => {
  const conformanceParts = {
    issuedAtUnixMilliseconds: edloveUuidV8ProfileV1AccountVector.issuedAtUnixMilliseconds,
    domain: edloveUuidV8ProfileV1AccountVector.domain,
    subtype: edloveUuidV8ProfileV1AccountVector.subtype,
    mintOrigin: edloveUuidV8ProfileV1AccountVector.mintOrigin,
    entropy: Uint8Array.from(edloveUuidV8ProfileV1AccountVector.entropy),
  };

  it('uses the same accepted and rejected vectors as the PostgreSQL validator test', () => {
    const vectors = readCrossRuntimeVectors();
    expect(vectors.get('canonical_account')).toEqual({
      candidate: edloveUuidV8ProfileV1AccountVector.uuid,
      expected: true,
    });
    expect(vectors.get('wrong_version')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.wrongVersion,
      expected: false,
    });
    expect(vectors.get('wrong_variant')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.wrongVariant,
      expected: false,
    });
    expect(vectors.get('unregistered_domain')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.unregisteredDomain,
      expected: false,
    });
    expect(vectors.get('wrong_identity_subtype')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.wrongIdentitySubtype,
      expected: false,
    });
    expect(vectors.get('unapproved_edge_origin')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.unapprovedEdgeOrigin,
      expected: false,
    });
    expect(vectors.get('unregistered_mint_origin')).toEqual({
      candidate: edloveUuidV8ProfileV1RejectedAccountVectors.unregisteredMintOrigin,
      expected: false,
    });
  });

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
