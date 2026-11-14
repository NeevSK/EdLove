import { getSelfRegistry } from './selfRegistry';
import type { MobileDomainRegistry } from './types';
import { getWorkspaceRegistry } from './workspaceRegistry';

export * from './types';
export { getSelfRegistry } from './selfRegistry';
export { getWorkspaceRegistry } from './workspaceRegistry';

/**
 * getDomainFeatureRegistry: Resolves the appropriate feature registry
 * for the given domain and active capacity/role.
 */
export function getDomainFeatureRegistry(
  domain: 'workspace' | 'self',
  capacity?: string | null,
): MobileDomainRegistry {
  switch (domain) {
    case 'workspace':
      return getWorkspaceRegistry();
    case 'self':
      return getSelfRegistry(capacity);
    default:
      return getWorkspaceRegistry();
  }
}
