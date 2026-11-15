import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import { timeProfileFromCapabilities } from '@repo/core/logic/registry/timeProfile';
import type { DomainFeature } from '@repo/core/types';

const WORKFORCE_BETA_LIFECYCLE = defineFeatureLifecycle({
  owner: 'workforce',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
  flagClass: 'beta',
});

export const WORKFORCE_REGISTRY: Record<string, DomainFeature> = {
  workforce: {
    id: 'workforce',
    surfaceId: 'workforce',
    ownerPackage: 'workforce',
    defaultZone: 'institution',
    defaultOrder: 150,
    icon: '💼',
    routes: { web: '/workspace/workforce' },
    roles: ['teacher', 'principal'],
    floor: { group: 'institutional', shape: 'card' },
    time: timeProfileFromCapabilities({ hasReview: true, hasPlan: true }, 'current', 'sealed'),
    label: 'Workforce & Leave',
    description: 'Institutional workforce planning and operations',
    citizenshipRequired: 1,
    mobileSupport: true,
    webSupport: true,
    state: 'development',
    flagKey: 'isDevelopingWorkforce',
    lifecycle: WORKFORCE_BETA_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'WorkforceRoster' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.workforce',
  },
};
