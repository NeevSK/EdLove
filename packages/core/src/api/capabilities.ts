export type CapabilityDomain = 'self' | 'workspace' | 'community' | 'library';
export type CapabilityStatus = 'available' | 'locked' | 'unavailable';
export type CapabilityAccessClass = 'public' | 'account-required' | 'open' | 'scoped' | 'private';

export type Capability = Readonly<{
  id: string;
  status: CapabilityStatus;
  allowedOperations: readonly ('read' | 'create')[];
  accessClass?: CapabilityAccessClass;
}>;

function isCapability(value: unknown): value is Capability {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  const accessClass = candidate.accessClass;
  return (
    typeof candidate.id === 'string' &&
    (candidate.status === 'available' ||
      candidate.status === 'locked' ||
      candidate.status === 'unavailable') &&
    Array.isArray(candidate.allowedOperations) &&
    candidate.allowedOperations.every(
      (operation) => operation === 'read' || operation === 'create',
    ) &&
    (accessClass === undefined ||
      accessClass === 'public' ||
      accessClass === 'account-required' ||
      accessClass === 'open' ||
      accessClass === 'scoped' ||
      accessClass === 'private')
  );
}

/** Parse the transport-neutral capability projection without granting access. */
export function parseCapabilityBootstrapPayload(payload: unknown): readonly Capability[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
  const features = (payload as Record<string, unknown>).features;
  return Array.isArray(features) ? features.filter(isCapability) : [];
}

export function capabilityIsAvailable(
  capabilities: readonly Capability[],
  featureId: string,
): boolean {
  return capabilities.some(
    (capability) => capability.id === featureId && capability.status === 'available',
  );
}
