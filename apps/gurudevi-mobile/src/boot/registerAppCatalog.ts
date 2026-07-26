import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry';
import { AI_REGISTRY } from '@repo/ai/constants/aiRegistry';
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry';
import { COMMUNITY_REGISTRY } from '@repo/community/constants/communityRegistry';
import { registerDomains } from '@repo/core/logic/registry/appCatalog';
import { FORM_BUILDER_REGISTRY } from '@repo/form-builder/constants/formBuilderRegistry';
import { LIBRARY_REGISTRY } from '@repo/library/constants/libraryRegistry';
import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { WORKFORCE_REGISTRY } from '@repo/workforce/constants/workforceRegistry';

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
    ...AI_REGISTRY,
    ...FORM_BUILDER_REGISTRY,
    ...WORKFORCE_REGISTRY,
  });
}
