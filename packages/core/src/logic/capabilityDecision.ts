import type { IdentityMode } from '@repo/core/logic/auth/identityState';
import type { AuthorizationDecision } from '@repo/core/logic/ports/authz.port';
import {
  type EntitlementReadiness,
  type EntitlementRequirement,
  type EntitlementSnapshot,
  meetsSubscriptionTier,
  resolveScopedEntitlement,
} from '@repo/core/logic/ports/entitlement.port';
import type { CitizenshipLevel } from '@repo/core/logic/registry/citizenship';
import { meetsCitizenship } from '@repo/core/logic/registry/citizenship';
import type { FeatureState } from '@repo/core/logic/registry/domainEntry';

/** The common interaction vocabulary that a feature may declare. */
export type CapabilityOperation = 'read' | 'create' | 'update' | 'delete' | 'export';

export type CapabilityTaskPolicy =
  | 'floor'
  | 'modal'
  | 'transient'
  | 'single'
  | 'per-resource'
  | 'date-scoped';

export type CapabilityStoragePolicy = 'cloud' | 'local-only' | 'hybrid' | 'none';
export type CapabilityScopeRequirement = 'active_bond' | 'tenant' | 'entity';

export type CapabilityPlatform = 'native' | 'browser';
export type CapabilityDomainMode = 'account' | 'explore' | 'sandbox' | 'demo';

export type CapabilityDecisionStatus =
  | 'available'
  | 'loading'
  | 'locked'
  | 'upgrade_required'
  | 'coming_soon'
  | 'unsupported'
  | 'disabled'
  | 'demo_only';

/** Stable reasons are safe for analytics and adapter-level presentation mapping. */
export type CapabilityDecisionReason =
  | 'available'
  | 'authorization_loading'
  | 'entitlement_loading'
  | 'privacy_loading'
  | 'identity_required'
  | 'mode_identity_mismatch'
  | 'scope_required'
  | 'citizenship_insufficient'
  | 'authorization_denied'
  | 'entitlement_required'
  | 'feature_in_development'
  | 'feature_deprecated'
  | 'feature_flag_disabled'
  | 'platform_unsupported'
  | 'privacy_consent_required'
  | 'privacy_contract_missing'
  | 'demo_mode';

export interface CapabilityFeatureDefinition {
  id: string;
  authorityRef: string;
  evidenceRef: string;
  lifecycleState: FeatureState;
  flagActive: boolean;
  supportedPlatforms: readonly CapabilityPlatform[];
  operations: readonly CapabilityOperation[];
  taskPolicy: CapabilityTaskPolicy;
  storagePolicy: CapabilityStoragePolicy;
  scopeRequirement?: CapabilityScopeRequirement;
  citizenshipRequired: CitizenshipLevel;
  entitlement?: EntitlementRequirement;
  /** Sensitive features must have an explicit privacy readiness decision. */
  requiresPrivacyConsent: boolean;
}

export interface CapabilityScope {
  activeBondId?: string | null;
  tenantId?: string | null;
  entityId?: string | null;
}

export interface CapabilityPrivacyContext {
  readiness: 'loading' | 'ready' | 'denied' | 'not_required';
}

export interface CapabilityAuthorizationContext {
  readiness: 'loading' | 'ready';
  decision?: AuthorizationDecision;
}

export interface ResolveCapabilityDecisionInput {
  feature: CapabilityFeatureDefinition;
  identityMode: IdentityMode;
  authSubjectId: string | null;
  scope: CapabilityScope;
  citizenship: CitizenshipLevel;
  entitlement: {
    readiness: EntitlementReadiness;
    snapshot: EntitlementSnapshot;
  };
  authorization: CapabilityAuthorizationContext;
  platform: CapabilityPlatform;
  mode: CapabilityDomainMode;
  privacy: CapabilityPrivacyContext;
}

export interface CapabilityDecision {
  status: CapabilityDecisionStatus;
  reason: CapabilityDecisionReason;
  allowedOperations: readonly CapabilityOperation[] | readonly ['none'];
  taskPolicy: CapabilityTaskPolicy;
  storagePolicy: CapabilityStoragePolicy;
  evidenceRef: string;
  authorityRef: string;
}

/**
 * The state contract shared by every feature surface. UI packages render this
 * data; this core contract deliberately has no UI dependency.
 */
export const FEATURE_SURFACE_STATES = [
  'initializing',
  'loading',
  'ready',
  'empty',
  'offline_stale',
  'saving',
  'saved',
  'retryable_error',
  'permission_denied',
  'unsupported',
  'disposed',
] as const;

export type FeatureSurfaceState = (typeof FEATURE_SURFACE_STATES)[number];

export interface FeatureSurfaceStateSnapshot {
  state: FeatureSurfaceState;
  lastKnownGoodAt: string | null;
  pendingMutationCount: number;
  canRetry: boolean;
  canEdit: boolean;
  isSensitive: boolean;
  safeMessage: string;
}

const NONE: readonly ['none'] = ['none'];

function isLocalOnlyMode(mode: CapabilityDomainMode): boolean {
  return mode === 'explore' || mode === 'sandbox' || mode === 'demo';
}

function hasMatchingIdentity(
  mode: CapabilityDomainMode,
  identityMode: IdentityMode,
  authSubjectId: string | null,
): boolean {
  if (mode === 'explore') return true;
  if (mode === 'sandbox') return identityMode === 'sandbox';
  if (mode === 'demo') return identityMode === 'demo';
  return identityMode === 'authenticated' && Boolean(authSubjectId);
}

function isEntitlementReady(readiness: EntitlementReadiness): boolean {
  return readiness === 'verified' || readiness === 'cached';
}

function hasRequiredScope(input: ResolveCapabilityDecisionInput): boolean {
  switch (input.feature.scopeRequirement) {
    case 'active_bond':
      return Boolean(input.scope.activeBondId);
    case 'tenant':
      return Boolean(input.scope.tenantId);
    case 'entity':
      return Boolean(input.scope.entityId);
    default:
      return true;
  }
}

function resolveStoragePolicy(
  featurePolicy: CapabilityStoragePolicy,
  mode: CapabilityDomainMode,
): CapabilityStoragePolicy {
  if (featurePolicy === 'none' || !isLocalOnlyMode(mode)) return featurePolicy;
  return 'local-only';
}

function decision(
  input: ResolveCapabilityDecisionInput,
  status: CapabilityDecisionStatus,
  reason: CapabilityDecisionReason,
  allowedOperations: CapabilityDecision['allowedOperations'],
): CapabilityDecision {
  return {
    status,
    reason,
    allowedOperations,
    taskPolicy: input.feature.taskPolicy,
    storagePolicy: resolveStoragePolicy(input.feature.storagePolicy, input.mode),
    evidenceRef: input.feature.evidenceRef,
    authorityRef: input.feature.authorityRef,
  };
}

function resolveStaticGate(input: ResolveCapabilityDecisionInput): CapabilityDecision | null {
  const { feature } = input;

  if (!feature.supportedPlatforms.includes(input.platform)) {
    return decision(input, 'unsupported', 'platform_unsupported', NONE);
  }

  if (feature.lifecycleState === 'deprecated') {
    return decision(input, 'disabled', 'feature_deprecated', NONE);
  }

  if (feature.lifecycleState === 'development') {
    return decision(input, 'coming_soon', 'feature_in_development', NONE);
  }

  if (!feature.flagActive) {
    return decision(input, 'disabled', 'feature_flag_disabled', NONE);
  }

  return null;
}

function resolveReadinessGate(input: ResolveCapabilityDecisionInput): CapabilityDecision | null {
  const { feature } = input;

  if (!hasMatchingIdentity(input.mode, input.identityMode, input.authSubjectId)) {
    if (input.mode === 'account' && !input.authSubjectId) {
      return decision(input, 'locked', 'identity_required', NONE);
    }
    return decision(input, 'unsupported', 'mode_identity_mismatch', NONE);
  }

  if (!hasRequiredScope(input)) {
    return decision(input, 'locked', 'scope_required', NONE);
  }

  if (input.authorization.readiness === 'loading') {
    return decision(input, 'loading', 'authorization_loading', NONE);
  }

  if (!isEntitlementReady(input.entitlement.readiness)) {
    return decision(input, 'loading', 'entitlement_loading', NONE);
  }

  if (feature.requiresPrivacyConsent && input.privacy.readiness === 'not_required') {
    return decision(input, 'locked', 'privacy_contract_missing', NONE);
  }

  if (input.privacy.readiness === 'loading') {
    return decision(input, 'loading', 'privacy_loading', NONE);
  }

  if (feature.requiresPrivacyConsent && input.privacy.readiness === 'denied') {
    return decision(input, 'locked', 'privacy_consent_required', NONE);
  }

  return null;
}

function satisfiesFeatureEntitlement(input: ResolveCapabilityDecisionInput): boolean {
  const requirement = input.feature.entitlement;
  if (!requirement) return true;

  const entitlement = resolveScopedEntitlement(input.entitlement.snapshot, requirement.scope);
  const hasRequiredTier =
    !requirement.tierAtLeast ||
    meetsSubscriptionTier(entitlement.pricingTier, requirement.tierAtLeast);
  const hasRequiredModules =
    !requirement.modulesAllOf ||
    requirement.modulesAllOf.every((module) => entitlement.activeEntitlements.includes(module));

  return hasRequiredTier && hasRequiredModules;
}

function resolveAccessGate(input: ResolveCapabilityDecisionInput): CapabilityDecision | null {
  if (input.authorization.decision?.permitted !== true) {
    return decision(input, 'locked', 'authorization_denied', NONE);
  }

  if (!meetsCitizenship(input.citizenship, input.feature.citizenshipRequired)) {
    return decision(input, 'locked', 'citizenship_insufficient', NONE);
  }

  if (!satisfiesFeatureEntitlement(input)) {
    return decision(input, 'upgrade_required', 'entitlement_required', NONE);
  }

  return null;
}

/**
 * Composes adapter-provided facts into the one product capability decision.
 * It never reads a store, calls a network service, or derives authorization
 * from presentation metadata.
 */
export function resolveCapabilityDecision(
  input: ResolveCapabilityDecisionInput,
): CapabilityDecision {
  const blockedByStaticGate = resolveStaticGate(input);
  if (blockedByStaticGate) return blockedByStaticGate;

  const blockedByReadinessGate = resolveReadinessGate(input);
  if (blockedByReadinessGate) return blockedByReadinessGate;

  const blockedByAccessGate = resolveAccessGate(input);
  if (blockedByAccessGate) return blockedByAccessGate;

  if (input.mode === 'demo') {
    return decision(input, 'demo_only', 'demo_mode', input.feature.operations);
  }

  return decision(input, 'available', 'available', input.feature.operations);
}
