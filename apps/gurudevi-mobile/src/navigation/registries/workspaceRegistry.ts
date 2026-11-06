import type { MobileDomainRegistry } from './types';

export function getWorkspaceRegistry(): MobileDomainRegistry {
  return {
    domain: 'workspace',
    title: 'Workspace',
    subtitle: 'Available workspace capabilities',
    items: [],
  };
}
