import { edloveUuidV8Domain, edloveUuidV8MintOrigin, edloveUuidV8Subtype } from './edloveUuidV8';

/**
 * Stable profile-v1 values shared by contract consumers. They contain no
 * credentials or authorization data and deliberately use public test entropy.
 */
export const edloveUuidV8ProfileV1AccountVector = {
  uuid: '01234567-89ab-8101-8000-010203040506',
  issuedAtUnixMilliseconds: 0x0123_4567_89ab,
  domain: edloveUuidV8Domain.identity,
  subtype: edloveUuidV8Subtype.account,
  mintOrigin: edloveUuidV8MintOrigin.centralProduction,
  entropy: [0, 1, 2, 3, 4, 5, 6],
} as const;

export const edloveUuidV8ProfileV1RejectedAccountVectors = {
  wrongVersion: '01234567-89ab-7101-8000-010203040506',
  wrongVariant: '01234567-89ab-8101-c000-010203040506',
  unregisteredDomain: '01234567-89ab-8e01-8000-010203040506',
  wrongIdentitySubtype: '01234567-89ab-8102-8000-010203040506',
  unapprovedEdgeOrigin: '01234567-89ab-8101-8200-010203040506',
  unregisteredSubtype: '01234567-89ab-81ff-8000-010203040506',
  unregisteredMintOrigin: '01234567-89ab-8101-8600-010203040506',
} as const;
