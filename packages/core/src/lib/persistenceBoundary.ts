/**
 * Core persistence contract for identifying the owner and allowed destination of a write.
 *
 * Explore, sandbox, demo, and guest state intentionally have different namespaces from an
 * account's synchronized state. Moving guest data into an account is a separate, explicitly
 * confirmed operation; deriving an account identity never performs that move.
 */
export const PERSISTENCE_NAMESPACE_VERSION = 'v1' as const;

export type PersistenceExperience = 'standard' | 'explore' | 'sandbox' | 'demo';

export type PersistencePrincipal =
  | { readonly kind: 'account'; readonly id: string }
  | { readonly kind: 'guest'; readonly id: string };

export interface PersistenceIdentityInput {
  readonly experience: PersistenceExperience;
  readonly principal: PersistencePrincipal;
}

const persistenceIdentityBrand: unique symbol = Symbol('PersistenceIdentity');

export type PersistenceIdentity = PersistenceIdentityInput & {
  readonly [persistenceIdentityBrand]: true;
};

export type PersistenceWriteTarget = 'local' | 'production';

export type ProductionWriteBlockReason =
  | 'guest-local-only'
  | 'explore-local-only'
  | 'sandbox-local-only'
  | 'demo-local-only';

export type PersistenceWriteDecision =
  | { readonly allowed: true; readonly target: PersistenceWriteTarget }
  | {
      readonly allowed: false;
      readonly target: 'production';
      readonly reason: ProductionWriteBlockReason;
    };

export interface ExplicitGuestToAccountMigration {
  readonly authorization: 'user-confirmed';
  readonly source: PersistenceIdentity;
  readonly target: PersistenceIdentity;
}

function assertNamespaceSegment(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Persistence ${label} must not be empty.`);
  }
  return encodeURIComponent(normalized);
}

/** Creates a validated identity for namespacing local persistence and routing writes. */
export function createPersistenceIdentity(input: PersistenceIdentityInput): PersistenceIdentity {
  return {
    experience: input.experience,
    principal: {
      kind: input.principal.kind,
      id: assertNamespaceSegment(input.principal.id, `${input.principal.kind} id`),
    },
    [persistenceIdentityBrand]: true,
  };
}

/**
 * Derives a stable, mode-specific local-storage namespace. Identifiers are encoded once when
 * the identity is created, so a caller cannot cause key-segment bleed with ':' or whitespace.
 */
export function derivePersistenceNamespace(identity: PersistenceIdentity): string {
  return [
    'gurudevi',
    PERSISTENCE_NAMESPACE_VERSION,
    'persistence',
    identity.experience,
    identity.principal.kind,
    identity.principal.id,
  ].join(':');
}

/** Adds a feature-owned key below the identity namespace. */
export function derivePersistenceKey(identity: PersistenceIdentity, key: string): string {
  return `${derivePersistenceNamespace(identity)}:${assertNamespaceSegment(key, 'key')}`;
}

/**
 * Decides whether a write may leave the device. Callers must check this before dispatching a
 * production mutation; local writes remain valid for all identities and experiences.
 */
export function resolvePersistenceWriteDecision(
  identity: PersistenceIdentity,
  target: PersistenceWriteTarget,
): PersistenceWriteDecision {
  if (target === 'local') return { allowed: true, target };

  if (identity.principal.kind === 'guest') {
    return { allowed: false, target, reason: 'guest-local-only' };
  }

  if (identity.experience === 'explore') {
    return { allowed: false, target, reason: 'explore-local-only' };
  }
  if (identity.experience === 'sandbox') {
    return { allowed: false, target, reason: 'sandbox-local-only' };
  }
  if (identity.experience === 'demo') {
    return { allowed: false, target, reason: 'demo-local-only' };
  }

  return { allowed: true, target };
}

/**
 * Records intent to migrate guest data after a user confirms it. This contract deliberately
 * does not copy, delete, or enqueue data; an adapter must execute a separately approved plan.
 */
export function requestGuestToAccountMigration(
  source: PersistenceIdentity,
  target: PersistenceIdentity,
  authorization: 'user-confirmed',
): ExplicitGuestToAccountMigration {
  if (source.principal.kind !== 'guest') {
    throw new Error('Guest-to-account migration must start from a guest identity.');
  }
  if (target.principal.kind !== 'account') {
    throw new Error('Guest-to-account migration must target an account identity.');
  }

  return { authorization, source, target };
}
