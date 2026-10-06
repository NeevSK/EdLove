export type CapabilityDomain = 'self' | 'workspace' | 'community' | 'library';
export type CapabilityPlatform = 'browser' | 'native';
export type CapabilityMode = 'account' | 'explore' | 'sandbox';
export type PracticeEffectPolicy = 'local-only';
export type PracticeFixturePolicy = 'fictional';
export type PracticeKeepPolicy = 'disabled' | 'new-records';

export type CapabilityPracticePolicy = Readonly<{
  platforms: readonly CapabilityPlatform[];
  fixture: PracticeFixturePolicy;
  effects: PracticeEffectPolicy;
  reset: 'feature-workspace';
  keep: PracticeKeepPolicy;
  capacities?: readonly string[];
}>;

export type PracticeAvailability =
  | { readonly available: true }
  | {
      readonly available: false;
      readonly reason:
        | 'not-declared'
        | 'platform-unsupported'
        | 'capacity-unsupported'
        | 'scope-required';
    };

/**
 * Static product declarations. They are not authorization decisions; the
 * account adapter evaluates the declared policy for every returned feature.
 */
export type CapabilityDeclaration = Readonly<{
  id: string;
  domain: CapabilityDomain;
  platforms: readonly CapabilityPlatform[];
  account: Readonly<{ action: 'read'; subject: string; requiresSelectedScope: boolean }>;
  localModes: readonly Exclude<CapabilityMode, 'account'>[];
  operations: readonly ('read' | 'create')[];
  taskPolicy: 'single' | 'modal';
  storagePolicy: 'cloud' | 'local-only';
  practice?: CapabilityPracticePolicy;
}>;

/** Initial browser delivery declarations; other domains add rows here, not new resolvers. */
export const CAPABILITY_MANIFEST: readonly CapabilityDeclaration[] = [
  {
    id: 'fire_journal',
    domain: 'self',
    platforms: ['browser', 'native'],
    account: { action: 'read', subject: 'Wellbeing', requiresSelectedScope: true },
    localModes: ['explore', 'sandbox'],
    operations: ['read', 'create'],
    taskPolicy: 'single',
    storagePolicy: 'cloud',
    practice: {
      platforms: ['browser'],
      fixture: 'fictional',
      effects: 'local-only',
      reset: 'feature-workspace',
      keep: 'disabled',
    },
  },
  {
    id: 'mood_lotus',
    domain: 'self',
    platforms: ['browser', 'native'],
    account: { action: 'read', subject: 'Wellbeing', requiresSelectedScope: true },
    localModes: ['explore', 'sandbox'],
    operations: ['read', 'create'],
    taskPolicy: 'modal',
    storagePolicy: 'cloud',
  },
  {
    id: 'attendance',
    domain: 'workspace',
    platforms: ['browser'],
    account: { action: 'read', subject: 'Classroom attendance', requiresSelectedScope: true },
    localModes: ['explore', 'sandbox'],
    operations: ['read', 'create'],
    taskPolicy: 'single',
    storagePolicy: 'cloud',
    practice: {
      platforms: ['browser'],
      fixture: 'fictional',
      effects: 'local-only',
      reset: 'feature-workspace',
      keep: 'disabled',
      capacities: [
        'teacher',
        'gradeHead',
        'sectionHead',
        'principal',
        'assistantPrincipal',
        'admin',
      ],
    },
  },
] as const;

export function declaredCapabilities(domain: CapabilityDomain, platform: CapabilityPlatform) {
  return CAPABILITY_MANIFEST.filter(
    (declaration) => declaration.domain === domain && declaration.platforms.includes(platform),
  );
}

export function declaredPracticeCapability(
  featureId: string,
  platform: CapabilityPlatform,
): CapabilityPracticePolicy | null {
  const declaration = CAPABILITY_MANIFEST.find((feature) => feature.id === featureId);
  const practice = declaration?.practice;
  return practice?.platforms.includes(platform) ? practice : null;
}

/** Resolves the shared entry gate; this is an affordance decision, not authorization. */
export function resolvePracticeAvailability(input: {
  featureId: string;
  platform: CapabilityPlatform;
  capacity?: string | null;
  hasSelectedScope: boolean;
}): PracticeAvailability {
  const declaration = CAPABILITY_MANIFEST.find((feature) => feature.id === input.featureId);
  const practice = declaration?.practice;
  if (!practice) return { available: false, reason: 'not-declared' };
  if (!practice.platforms.includes(input.platform))
    return { available: false, reason: 'platform-unsupported' };
  if (declaration.account.requiresSelectedScope && !input.hasSelectedScope)
    return { available: false, reason: 'scope-required' };
  if (
    practice.capacities &&
    (!input.capacity || !practice.capacities.some((value) => value.toLowerCase() === input.capacity?.toLowerCase()))
  )
    return { available: false, reason: 'capacity-unsupported' };
  return { available: true };
}
