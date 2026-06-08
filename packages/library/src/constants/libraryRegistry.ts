import type { DomainFeature } from '@repo/core/types';

export const LIBRARY_REGISTRY: Record<string, DomainFeature> = {
  the_archive: {
    id: 'archive',
    surfaceId: 'archive',
    workspaceId: 'library-archive',
    capabilityKey: 'LibraryArchive',
    ownerPackage: 'library',
    defaultZone: 'work',
    defaultOrder: 10,
    label: 'The Archive',
    description: 'Personal and shared knowledge repositories',
    citizenshipRequired: 0, // Wanderers can have local archives
    mobileSupport: true,
    webSupport: true,
  },
  resource_hub: {
    id: 'hub',
    surfaceId: 'resource-hub',
    workspaceId: 'library-archive',
    capabilityKey: 'LibraryResource',
    ownerPackage: 'library',
    defaultZone: 'work',
    defaultOrder: 20,
    label: 'Resource Hub',
    description: 'Educational materials, curriculum, and shared tools',
    citizenshipRequired: 0,
    mobileSupport: true,
    webSupport: true,
  },
  curator_studio: {
    id: 'curator',
    surfaceId: 'curator-studio',
    workspaceId: 'library-archive',
    capabilityKey: 'LibraryReview',
    ownerPackage: 'library',
    defaultZone: 'institution',
    defaultOrder: 30,
    label: 'Curator Studio',
    description: 'Manage school-wide resources and library collections',
    citizenshipRequired: 2, // 1st Class (Role-bound)
    isPro: true,
    webSupport: true,
  },
};
