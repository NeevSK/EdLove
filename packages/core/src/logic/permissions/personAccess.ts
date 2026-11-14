import type { FeatureAccessContext } from '@repo/core/logic/permissions/accessContext';
import {
  CITIZENSHIP,
  type FeatureRequirement,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import type {
  EntitlementReadiness,
  EntitlementSnapshot,
} from '@repo/core/logic/ports/entitlement.port';
import {
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import type { CitizenshipTier } from '@repo/core/types/Identity';
import { cedarActionFor } from '@repo/policies/authorizationRegistry';

export type CedarDecision = 'allow' | 'deny' | 'no_decision';

/**
 * What SanctuaryFeature knows about one person in their active bond. The phone
 * fills it from its stores; the web server fills it from the authorized entry
 * and the signed permission snapshot. Either way the same gates run.
 */
export interface PersonAccess {
  userId: string | null;
  isLocalOnly: boolean;
  activeBondId: string | null;
  activeEntityId: string | null;
  activeEntityType: string | null;
  schoolId: string | null;
  capacity: string | null;
  citizenship: CitizenshipTier;
  cedarSnapshotLoaded: boolean;
  decisionOf: (subject: string, action: string) => CedarDecision;
  entitlement: EntitlementSnapshot;
  entitlementManifestLoaded: boolean;
  entitlementReadiness?: EntitlementReadiness;
  flags: object;
}

const LEVEL: Record<CitizenshipTier, FeatureAccessContext['citizenship']> = {
  FIRST_CLASS: CITIZENSHIP.FIRST_CLASS,
  SECOND_CLASS: CITIZENSHIP.SECOND_CLASS,
  THIRD_CLASS: CITIZENSHIP.THIRD_CLASS,
};

/** SanctuaryFeature's gates for one feature, for this person now. Pure. */
export function evaluateFeatureFor(
  person: PersonAccess,
  action: string,
  subject: string,
  requirement?: FeatureRequirement,
): SanctuaryFeatureResult {
  const req: FeatureRequirement = requirement ?? { citizenshipRequired: CITIZENSHIP.THIRD_CLASS };
  const flagKey = req.flagKey ?? `${subject}.${action}`;
  return sanctuaryFeature(
    {
      userId: person.userId,
      isLocalOnly: person.isLocalOnly,
      activeBondId: person.activeBondId,
      activeEntityId: person.activeEntityId,
      activeEntityType: person.activeEntityType,
      schoolId: person.schoolId,
      primaryCapacity: person.capacity,
      cedarSnapshotLoaded: person.cedarSnapshotLoaded,
      entitlementManifestLoaded: person.entitlementManifestLoaded,
      entitlementReadiness: person.entitlementReadiness,
      citizenship: LEVEL[person.citizenship] ?? CITIZENSHIP.THIRD_CLASS,
      entitlement: person.entitlement,
      cedarDecision: person.userId ? person.decisionOf(subject, action) : 'no_decision',
      flagActive: resolveFeatureFlagValue(person.flags, flagKey),
      flagKey,
      flagType: resolveFeatureFlagClass(flagKey),
    },
    req,
  );
}

/** Cedar's answer from a signed snapshot's permission map (subject → action → allowed). */
export function decisionsFromPermissions(
  permissions: Readonly<Record<string, Readonly<Record<string, unknown>>>> | null,
): (subject: string, action: string) => CedarDecision {
  return (subject, action) => {
    const actions = permissions?.[subject];
    if (!actions) return 'no_decision';
    const value = actions[action] ?? actions[cedarActionFor(action, subject)];
    return typeof value === 'boolean' ? (value ? 'allow' : 'deny') : 'no_decision';
  };
}
