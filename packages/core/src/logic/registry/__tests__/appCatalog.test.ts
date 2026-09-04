import {
  _resetCatalogForTesting,
  getAllDomains,
  registerDomains,
} from '@repo/core/logic/registry/appCatalog';
import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship';
import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';
import { validateFeatureFlagManifest } from '@repo/core/logic/registry/featureLifecycleManifest';
import { beforeEach, describe, expect, it } from 'vitest';

const baseEntry: DomainEntry = {
  id: 'community.hearth',
  label: 'The Hearth',
  ownerPackage: 'community',
  mobileSupport: true,
  webSupport: true,
  state: 'live',
  lifecycle: {
    owner: 'community',
    createdAt: '2026-07-26',
    reviewAt: '2026-09-30',
    permanentJustification: 'Test catalog capability.',
  },
  citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
  capabilityRequirement: { action: 'read', subject: 'CommunityFeed' },
  tabDomain: 'community',
  surfaceId: 'hearth',
  defaultOrder: 10,
  analyticsKey: 'community.hearth',
};

describe('AppCatalog lifecycle contract', () => {
  beforeEach(() => {
    _resetCatalogForTesting();
  });

  it('parses every active lifecycle manifest record at registration time', () => {
    expect(() => validateFeatureFlagManifest()).not.toThrow();
  });

  it('accepts a live entry without a rollout flag', () => {
    registerDomains({ 'community.hearth': baseEntry });
    expect(getAllDomains()).toHaveLength(1);
  });

  it('requires a GrowthBook key for beta entries', () => {
    expect(() => registerDomains({ 'community.hearth': { ...baseEntry, state: 'beta' } })).toThrow(
      'requires a GrowthBook flagKey',
    );
  });

  it('rejects a catalog entry without lifecycle metadata', () => {
    const incompleteEntry = { ...baseEntry, lifecycle: undefined } as unknown as DomainEntry;
    expect(() => registerDomains({ 'community.hearth': incompleteEntry })).toThrow();
  });

  it('requires a flag class when a catalog entry uses GrowthBook', () => {
    expect(() =>
      registerDomains({
        'community.hearth': { ...baseEntry, flagKey: 'community.hearth.release' },
      }),
    ).toThrow('requires a lifecycle flagClass');
  });

  it('requires catalog and manifest flag classes to agree', () => {
    expect(() =>
      registerDomains({
        'community.hearth': {
          ...baseEntry,
          flagKey: 'isAIAssistantEnabled',
          lifecycle: {
            ...baseEntry.lifecycle,
            flagClass: 'operational',
          },
        },
      }),
    ).toThrow('flag class mismatch');
  });

  it('requires registry keys to match entry identities', () => {
    expect(() => registerDomains({ wrong_key: baseEntry })).toThrow('must match entry id');
  });
});
