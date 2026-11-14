import { ADMIN_REGISTRY } from '@repo/admin/constants/adminRegistry';
import { AI_REGISTRY } from '@repo/ai/constants/aiRegistry';
import { CLASSROOM_REGISTRY } from '@repo/classroom/constants/classroomRegistry';
import { COMMUNITY_REGISTRY } from '@repo/community/constants/communityRegistry';
import { getAllDomains, registerDomains } from '@repo/core/logic/registry/appCatalog';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';
import { FORM_BUILDER_REGISTRY } from '@repo/form-builder/constants/formBuilderRegistry';
import { LIBRARY_REGISTRY } from '@repo/library/constants/libraryRegistry';
import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { WORKFORCE_REGISTRY } from '@repo/workforce/constants/workforceRegistry';

/**
 * The AppCatalog on the web: every room's feature catalog, the same
 * registries the phone registers (apps/gurudevi-mobile/src/boot/registerAppCatalog.ts).
 * Rooms, floors and SanctuaryFeature read features from here and nowhere else.
 */
export const APP_CATALOG: Readonly<Record<string, DomainEntry>> = {
  ...SELF_REGISTRY,
  ...CLASSROOM_REGISTRY,
  ...COMMUNITY_REGISTRY,
  ...LIBRARY_REGISTRY,
  ...ADMIN_REGISTRY,
  ...AI_REGISTRY,
  ...FORM_BUILDER_REGISTRY,
  ...WORKFORCE_REGISTRY,
};

let registered = false;

/** Register the catalog once, so useDomainFeature works on the web too. */
export function registerWebAppCatalog(): void {
  if (registered) return;
  try {
    getAllDomains();
  } catch {
    registerDomains({ ...APP_CATALOG });
  }
  registered = true;
}
