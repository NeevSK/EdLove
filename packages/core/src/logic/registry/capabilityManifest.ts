export type CapabilityDomain = 'self' | 'workspace' | 'community' | 'library';
export type CapabilityPlatform = 'browser' | 'native';
export type CapabilityMode = 'account' | 'explore' | 'sandbox';

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
] as const;

export function declaredCapabilities(domain: CapabilityDomain, platform: CapabilityPlatform) {
  return CAPABILITY_MANIFEST.filter(
    (declaration) => declaration.domain === domain && declaration.platforms.includes(platform),
  );
}
