import { communityRegistry } from './communityRegistry';
import { libraryRegistry } from './libraryRegistry';
import { profileRegistry } from './profileRegistry';
import { getSelfRegistry } from './selfRegistry';
import type { MobileDomainRegistry } from './types';
import { getWorkspaceRegistry } from './workspaceRegistry';

export * from './types';
export { communityRegistry } from './communityRegistry';
export { libraryRegistry } from './libraryRegistry';
export { profileRegistry } from './profileRegistry';
export { getSelfRegistry } from './selfRegistry';
export { getWorkspaceRegistry } from './workspaceRegistry';

/**
 * getDomainFeatureRegistry: Resolves the appropriate feature registry
 * for the given domain and active capacity/role.
 */
export function getDomainFeatureRegistry(
  domain: 'workspace' | 'self' | 'library' | 'community' | 'profile',
  capacity?: string | null,
): MobileDomainRegistry {
  switch (domain) {
    case 'workspace':
      return getWorkspaceRegistry(capacity);
    case 'self':
      return getSelfRegistry(capacity);
    case 'library':
      return libraryRegistry;
    case 'community':
      return communityRegistry;
    case 'profile':
      return profileRegistry;
    default:
      return getWorkspaceRegistry(capacity);
  }
}
