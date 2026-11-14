import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry';
import { AI_REGISTRY } from '@repo/ai/constants/aiRegistry';
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry';
import { COMMUNITY_REGISTRY } from '@repo/community/constants/communityRegistry';
import { registerDomains } from '@repo/core/logic/registry/appCatalog';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';
import { FORM_BUILDER_REGISTRY } from '@repo/form-builder/constants/formBuilderRegistry';
import { LIBRARY_REGISTRY } from '@repo/library/constants/libraryRegistry';
import { PROFILE_REGISTRY } from '@repo/profile/constants/profileRegistry';
import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { registerMediaAdapters } from '@repo/ui/components/native';
import { WORKFORCE_REGISTRY } from '@repo/workforce/constants/workforceRegistry';
import { mobileMediaAdapters } from '../media/mediaAdapters';

/**
 * Every room's feature catalog, the same registries the web registers
 * (apps/gurudevi-web/lib/appCatalog.ts). Rooms, floors and SanctuaryFeature
 * read features from here and nowhere else.
 */
export const APP_CATALOG: Readonly<Record<string, DomainEntry>> = {
  ...SELF_REGISTRY,
  ...CLASSROOM_REGISTRY,
  ...COMMUNITY_REGISTRY,
  ...LIBRARY_REGISTRY,
  ...PROFILE_REGISTRY,
  ...ADMIN_REGISTRY,
  ...AI_REGISTRY,
  ...FORM_BUILDER_REGISTRY,
  ...WORKFORCE_REGISTRY,
};

let isAppCatalogRegistered = false;

/**
 * registerAppCatalog — assembles all domain registries into
 * the AppCatalog singleton.
 *
 * Call this once during boot hydration BEFORE any screen renders.
 * See: gurudevi-data-state-lifecycle.md boot sequence step 9.
 *
 * Adding a new domain package: create its registry conforming to DomainEntry,
 * then add it to APP_CATALOG here and in the web's lib/appCatalog.ts.
 */
export function registerAppCatalog(): void {
  if (isAppCatalogRegistered) return;

  // The kit's media ports, filled with this app's native modules (audio, pickers).
  registerMediaAdapters(mobileMediaAdapters);

  registerDomains({ ...APP_CATALOG });
  isAppCatalogRegistered = true;
}
