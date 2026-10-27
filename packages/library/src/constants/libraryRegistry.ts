import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import type { DomainFeature } from '@repo/core/types';

const REGISTRY_LIFECYCLE = defineFeatureLifecycle({
  owner: 'library',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  permanentJustification: 'Stable catalog capability governed by the AppCatalog owner.',
});

export const LIBRARY_REGISTRY: Record<string, DomainFeature> = {
  archive: {
    id: 'archive',
    surfaceId: 'archive',
    ownerPackage: 'library',
    defaultZone: 'work',
    defaultOrder: 10,
    label: 'The Archive',
    description: 'Personal and shared knowledge repositories',
    citizenshipRequired: 3, // Wanderers can have local archives
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    lifecycle: REGISTRY_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'LibraryArchive' },
    tabDomain: 'library',
    analyticsKey: 'library.archive',
    journey: {
      featureId: 'archive',
      targetPersonas: ['student', 'teacher', 'guardian', 'principal', 'founder'],
      stage: 'daily_circadian',
      entryRoute: '/library',
      sequence: [
        {
          step: 0,
          screenId: 'library_catalog',
          route: '/library',
          title: 'The Living Archive',
          purpose: 'on_ramp',
        },
        {
          step: 1,
          screenId: 'resource_reader',
          route: '/library/resource/[id]',
          title: 'Read & Study',
          purpose: 'primary_action',
        },
      ],
      feedback: {
        tutiiMode: 'guiding',
        tutiiRole: 'guide',
        haptic: 'selection',
        soundChime: 'subtle_tap',
      },
    },
  },
  hub: {
    id: 'hub',
    surfaceId: 'resource-hub',
    ownerPackage: 'library',
    defaultZone: 'work',
    defaultOrder: 20,
    label: 'Resource Hub',
    description: 'Educational materials, curriculum, and shared tools',
    citizenshipRequired: 3,
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    lifecycle: REGISTRY_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'LibraryResource' },
    tabDomain: 'library',
    analyticsKey: 'library.hub',
  },
  curator: {
    id: 'curator',
    surfaceId: 'curator-studio',
    ownerPackage: 'library',
    defaultZone: 'institution',
    defaultOrder: 30,
    label: 'Curator Studio',
    description: 'Manage school-wide resources and library collections',
    citizenshipRequired: 2, // 2nd Class
    entitlementTier: 'PRO',
    entitlementModule: 'curator_studio',
    mobileSupport: false,
    webSupport: true,
    state: 'live',
    lifecycle: REGISTRY_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'LibraryReview' },
    tabDomain: 'library',
    analyticsKey: 'library.curator',
  },
};
