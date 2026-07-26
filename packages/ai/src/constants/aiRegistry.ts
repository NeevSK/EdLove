import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import type { DomainFeature } from '@repo/core/types';

const AI_BETA_LIFECYCLE = defineFeatureLifecycle({
  owner: 'ai',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
  flagClass: 'beta',
});

export const AI_REGISTRY: Record<string, DomainFeature> = {
  'ai-assistant': {
    id: 'ai-assistant',
    surfaceId: 'ai-assistant',
    ownerPackage: 'ai',
    defaultZone: 'outlook',
    defaultOrder: 130,
    label: 'Gurudevi AI',
    description: 'Contextual assistant and guided intelligence surface',
    citizenshipRequired: 3,
    mobileSupport: true,
    webSupport: true,
    state: 'beta',
    flagKey: 'isAIAssistantEnabled',
    lifecycle: AI_BETA_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'AIAssistantScale' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.ai_assistant',
  },
};
