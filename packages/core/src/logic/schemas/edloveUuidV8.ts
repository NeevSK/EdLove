/**
 * EdLove's UUIDv8 layout is a platform contract, not an authorization claim.
 * See docs/architecture/edlove-sovereign-uuidv8-specification.md.
 */

export const edloveUuidV8Domain = {
  identity: 0x1,
  education: 0x2,
  learningRecord: 0x3,
  relationship: 0x4,
  knowledge: 0x5,
  operations: 0x6,
  test: 0xf,
} as const;

export const edloveUuidV8Subtype = {
  account: { domain: edloveUuidV8Domain.identity, value: 0x01 },
  credentialBinding: { domain: edloveUuidV8Domain.identity, value: 0x02 },
  deviceIdentity: { domain: edloveUuidV8Domain.identity, value: 0x03 },
  workloadPrincipal: { domain: edloveUuidV8Domain.identity, value: 0x04 },
  school: { domain: edloveUuidV8Domain.education, value: 0x01 },
  classroom: { domain: edloveUuidV8Domain.education, value: 0x02 },
  academicCycle: { domain: edloveUuidV8Domain.education, value: 0x03 },
  subject: { domain: edloveUuidV8Domain.education, value: 0x04 },
  gradeMark: { domain: edloveUuidV8Domain.learningRecord, value: 0x01 },
  attendance: { domain: edloveUuidV8Domain.learningRecord, value: 0x02 },
  submission: { domain: edloveUuidV8Domain.learningRecord, value: 0x03 },
  membershipBond: { domain: edloveUuidV8Domain.relationship, value: 0x01 },
  guardianRelation: { domain: edloveUuidV8Domain.relationship, value: 0x02 },
  delegation: { domain: edloveUuidV8Domain.relationship, value: 0x03 },
  work: { domain: edloveUuidV8Domain.knowledge, value: 0x01 },
  edition: { domain: edloveUuidV8Domain.knowledge, value: 0x02 },
  collection: { domain: edloveUuidV8Domain.knowledge, value: 0x03 },
  operationReceipt: { domain: edloveUuidV8Domain.operations, value: 0x01 },
  auditEvent: { domain: edloveUuidV8Domain.operations, value: 0x02 },
  outboxOperation: { domain: edloveUuidV8Domain.operations, value: 0x03 },
  conformanceVector: { domain: edloveUuidV8Domain.test, value: 0x01 },
} as const;

export const edloveUuidV8MintOrigin = {
  centralProduction: 0x00,
  nonProduction: 0x01,
  edge: 0x02,
  mobileOffline: 0x03,
  browserOffline: 0x04,
  agent: 0x05,
  test: 0x3f,
} as const;

type ValueOf<T> = T[keyof T];

export type EdloveUuidV8Domain = ValueOf<typeof edloveUuidV8Domain>;
export type EdloveUuidV8MintOrigin = ValueOf<typeof edloveUuidV8MintOrigin>;
export type EdloveUuidV8Subtype = ValueOf<typeof edloveUuidV8Subtype>;

export type EdloveUuidV8Parts = {
  issuedAtUnixMilliseconds: number;
  domain: EdloveUuidV8Domain;
  subtype: EdloveUuidV8Subtype;
  mintOrigin: EdloveUuidV8MintOrigin;
  entropy: Uint8Array;
};

export type ParsedEdloveUuidV8 = EdloveUuidV8Parts;

const UUID_BYTE_LENGTH = 16;
const ENTROPY_BYTE_LENGTH = 7;
const MAX_TIMESTAMP = 0xffff_ffff_ffff;
const UUID_TEXT_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasKnownDomain(value: number): value is EdloveUuidV8Domain {
  return Object.values(edloveUuidV8Domain).includes(value as EdloveUuidV8Domain);
}

function hasKnownMintOrigin(value: number): value is EdloveUuidV8MintOrigin {
  return Object.values(edloveUuidV8MintOrigin).includes(value as EdloveUuidV8MintOrigin);
}

function hasKnownSubtype(domain: EdloveUuidV8Domain, subtype: number): boolean {
  return Object.values(edloveUuidV8Subtype).some(
    (candidate) => candidate.domain === domain && candidate.value === subtype,
  );
}

function assertParts(parts: EdloveUuidV8Parts): void {
  if (
    !Number.isSafeInteger(parts.issuedAtUnixMilliseconds) ||
    parts.issuedAtUnixMilliseconds < 0 ||
    parts.issuedAtUnixMilliseconds > MAX_TIMESTAMP
  ) {
    throw new RangeError('issuedAtUnixMilliseconds must fit in the UUIDv8 48-bit timestamp field.');
  }

  if (!hasKnownDomain(parts.domain) || !hasKnownSubtype(parts.domain, parts.subtype.value)) {
    throw new TypeError('domain and subtype must be a registered EdLove UUIDv8 entity kind.');
  }

  if (parts.subtype.domain !== parts.domain || !hasKnownMintOrigin(parts.mintOrigin)) {
    throw new TypeError('subtype must belong to domain and mintOrigin must be registered.');
  }

  if (parts.entropy.length !== ENTROPY_BYTE_LENGTH) {
    throw new RangeError('entropy must contain exactly 56 bits (7 bytes).');
  }
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseBytes(value: string): Uint8Array | null {
  if (!UUID_TEXT_PATTERN.test(value)) return null;

  const hex = value.replaceAll('-', '');
  const bytes = new Uint8Array(UUID_BYTE_LENGTH);
  for (let index = 0; index < UUID_BYTE_LENGTH; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function byteAt(bytes: Uint8Array, index: number): number {
  const byte = bytes[index];
  if (byte === undefined) {
    throw new RangeError('UUID byte array is unexpectedly incomplete.');
  }
  return byte;
}

/** Encodes vetted data. Only a trusted issuer may supply unpredictable entropy. */
export function encodeEdloveUuidV8(parts: EdloveUuidV8Parts): string {
  assertParts(parts);

  const bytes = new Uint8Array(UUID_BYTE_LENGTH);
  let timestamp = BigInt(parts.issuedAtUnixMilliseconds);
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }

  bytes[6] = 0x80 | parts.domain;
  bytes[7] = parts.subtype.value;
  bytes[8] = 0x80 | parts.mintOrigin;
  bytes.set(parts.entropy, 9);
  return formatUuid(bytes);
}

/** Parses only IDs that conform to the active EdLove UUIDv8 registry. */
export function parseEdloveUuidV8(value: string): ParsedEdloveUuidV8 | null {
  const bytes = parseBytes(value);
  if (!bytes || byteAt(bytes, 6) >>> 4 !== 0x8 || byteAt(bytes, 8) >>> 6 !== 0x2) return null;

  const domain = byteAt(bytes, 6) & 0x0f;
  const subtypeValue = byteAt(bytes, 7);
  const mintOrigin = byteAt(bytes, 8) & 0x3f;
  if (
    !hasKnownDomain(domain) ||
    !hasKnownSubtype(domain, subtypeValue) ||
    !hasKnownMintOrigin(mintOrigin)
  ) {
    return null;
  }

  const subtype = Object.values(edloveUuidV8Subtype).find(
    (candidate) => candidate.domain === domain && candidate.value === subtypeValue,
  );
  if (!subtype) return null;

  let issuedAtUnixMilliseconds = 0;
  for (let index = 0; index < 6; index += 1) {
    issuedAtUnixMilliseconds = issuedAtUnixMilliseconds * 256 + byteAt(bytes, index);
  }

  return {
    issuedAtUnixMilliseconds,
    domain,
    subtype,
    mintOrigin,
    entropy: bytes.slice(9),
  };
}

export function isEdloveUuidV8(value: string): boolean {
  return parseEdloveUuidV8(value) !== null;
}

/** Canonical accounts accept only the registered central Identity/account profile. */
export function isEdloveAccountId(value: string): boolean {
  const parts = parseEdloveUuidV8(value);
  return (
    parts !== null &&
    parts.domain === edloveUuidV8Domain.identity &&
    parts.subtype.value === edloveUuidV8Subtype.account.value &&
    (parts.mintOrigin === edloveUuidV8MintOrigin.centralProduction ||
      parts.mintOrigin === edloveUuidV8MintOrigin.nonProduction)
  );
}
