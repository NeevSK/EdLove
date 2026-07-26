import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import type { DomainFeature } from '@repo/core/types';

const FORM_BUILDER_BETA_LIFECYCLE = defineFeatureLifecycle({
  owner: 'form-builder',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
  flagClass: 'beta',
});

export const FORM_BUILDER_REGISTRY: Record<string, DomainFeature> = {
  'form-builder': {
    id: 'form-builder',
    surfaceId: 'form-builder',
    ownerPackage: 'form-builder',
    defaultZone: 'work',
    defaultOrder: 140,
    label: 'Form Builder',
    description: 'Controlled authoring surface for structured forms',
    citizenshipRequired: 2,
    mobileSupport: false,
    webSupport: true,
    state: 'development',
    flagKey: 'isDevelopingFormBuilder',
    lifecycle: FORM_BUILDER_BETA_LIFECYCLE,
    capabilityRequirement: { action: 'access', subject: 'ProFeatures' },
    entitlementTier: 'PRO',
    tabDomain: 'workspace',
    analyticsKey: 'workspace.form_builder',
  },
};
