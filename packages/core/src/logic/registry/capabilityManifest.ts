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
  persistence: Readonly<{
    mode: 'local-isolated';
    documentId: string;
    documentSchemaId: string;
    legacyLocations?: readonly Readonly<{ documentId: string; recordId: string }>[];
    lifecycle: Readonly<{ inactivityDays: number; maxDocuments: number; maxBytes: number }>;
  }>;
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

export type CapabilityAccessClass = 'public' | 'account-required' | 'open' | 'scoped' | 'private';

/**
 * Static product declarations. They are not authorization decisions; the
 * account adapter evaluates the declared policy for every returned feature.
 */
export type CapabilityDeclaration = Readonly<{
  id: string;
  domain: CapabilityDomain;
  platforms: readonly CapabilityPlatform[];
  accessClass: CapabilityAccessClass;
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
    accessClass: 'account-required',
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
      persistence: {
        mode: 'local-isolated',
        documentId: 'fire-journal',
        documentSchemaId: 'fire-journal-practice-v1',
        legacyLocations: [{ documentId: 'self', recordId: 'self:fire_journal' }],
        lifecycle: { inactivityDays: 30, maxDocuments: 20, maxBytes: 256 * 1024 },
      },
    },
  },
  {
    id: 'mood_lotus',
    domain: 'self',
    platforms: ['browser', 'native'],
    accessClass: 'account-required',
    account: { action: 'read', subject: 'Wellbeing', requiresSelectedScope: true },
    localModes: ['explore', 'sandbox'],
    operations: ['read', 'create'],
    taskPolicy: 'modal',
    storagePolicy: 'cloud',
  },
  {
    id: 'attendance',
    domain: 'workspace',
    platforms: ['browser', 'native'],
    accessClass: 'scoped',
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
      persistence: {
        mode: 'local-isolated',
        documentId: 'daily-roll-call',
        documentSchemaId: 'attendance-daily-roll-call-v1',
        lifecycle: { inactivityDays: 30, maxDocuments: 20, maxBytes: 256 * 1024 },
      },
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
  {
    id: 'climate_sensing',
    domain: 'workspace',
    platforms: ['browser', 'native'],
    accessClass: 'scoped',
    account: { action: 'read', subject: 'Classroom climate', requiresSelectedScope: true },
    localModes: ['explore', 'sandbox'],
    operations: ['read'],
    taskPolicy: 'single',
    storagePolicy: 'cloud',
    practice: {
      platforms: ['browser', 'native'],
      fixture: 'fictional',
      effects: 'local-only',
      reset: 'feature-workspace',
      keep: 'disabled',
      persistence: {
        mode: 'local-isolated',
        documentId: 'climate-sensing',
        documentSchemaId: 'climate-sensing-v1',
        lifecycle: { inactivityDays: 30, maxDocuments: 20, maxBytes: 256 * 1024 },
      },
      capacities: ['teacher', 'principal', 'admin'],
    },
  },
  {
    id: 'learning_studio',
    domain: 'workspace',
    platforms: ['browser'],
    accessClass: 'scoped',
    account: { action: 'read', subject: 'Learning studio', requiresSelectedScope: true },
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
      persistence: {
        mode: 'local-isolated',
        documentId: 'learning-studio',
        documentSchemaId: 'learning-studio-v1',
        lifecycle: { inactivityDays: 30, maxDocuments: 20, maxBytes: 256 * 1024 },
      },
      capacities: ['teacher', 'student'],
    },
  },
  {
    id: 'family_bridge',
    domain: 'workspace',
    platforms: ['browser'],
    accessClass: 'scoped',
    account: { action: 'read', subject: 'Family communication', requiresSelectedScope: true },
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
      persistence: {
        mode: 'local-isolated',
        documentId: 'family-bridge',
        documentSchemaId: 'family-bridge-v1',
        lifecycle: { inactivityDays: 30, maxDocuments: 20, maxBytes: 256 * 1024 },
      },
      capacities: ['teacher', 'guardian'],
    },
  },
] as const;

export function declaredCapability(featureId: string): CapabilityDeclaration | undefined {
  return CAPABILITY_MANIFEST.find((feature) => feature.id === featureId);
}

export function declaredCapabilities(domain: CapabilityDomain, platform: CapabilityPlatform) {
  return CAPABILITY_MANIFEST.filter(
    (declaration) => declaration.domain === domain && declaration.platforms.includes(platform),
  );
}

export function getCapabilitiesForCapacity(
  domain: CapabilityDomain,
  platform: CapabilityPlatform,
  capacity: string,
): readonly CapabilityDeclaration[] {
  return declaredCapabilities(domain, platform).filter((declaration) => {
    const capacities = declaration.practice?.capacities;
    if (!capacities) return false;
    return capacities.some((c: string) => c.toLowerCase() === capacity.toLowerCase());
  });
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
    (!input.capacity ||
      !practice.capacities.some((value) => value.toLowerCase() === input.capacity?.toLowerCase()))
  )
    return { available: false, reason: 'capacity-unsupported' };
  return { available: true };
}
