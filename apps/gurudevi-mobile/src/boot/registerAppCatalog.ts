import { registerDomains } from '@repo/core/logic/registry/appCatalog';
import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry';
import { COMMUNITY_REGISTRY } from '@repo/community/constants/communityRegistry';
import { LIBRARY_REGISTRY } from '@repo/library/constants/libraryRegistry';
import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry';

/**
 * registerAppCatalog — assembles all domain registries into
 * the AppCatalog singleton.
 *
 * Call this once during boot hydration BEFORE any screen renders.
 * See: gurudevi-data-state-lifecycle.md boot sequence step 9.
 *
 * Adding a new domain package:
 * 1. Create its registry file conforming to DomainEntry
 * 2. Import and spread it here
 * 3. Done — the catalog picks it up automatically
 */
export function registerAppCatalog(): void {
  registerDomains({
    ...SELF_REGISTRY,
    ...CLASSROOM_REGISTRY,
    ...COMMUNITY_REGISTRY,
    ...LIBRARY_REGISTRY,
    ...ADMIN_REGISTRY,
  });
}
