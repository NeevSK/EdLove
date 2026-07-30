import { describe, expect, it } from 'vitest';
import {
  type FeatureFlagMetadata,
  FeatureFlagMetadataSchema,
  fallbackForFeatureFlagClass,
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { validateFeatureLifecycleAction } from '@repo/core/logic/registry/featureLifecyclePolicy';

const releaseMetadata: FeatureFlagMetadata = {
  owner: 'test',
  class: 'release',
  disposition: 'retire-after-migration',
  purpose: 'Test release.',
  intendedAudience: 'Test cohort.',
  safeDefault: true,
  cleanupNote: 'Remove after test.',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
};

const operationalMetadata: FeatureFlagMetadata = {
  owner: 'test',
  class: 'operational',
  disposition: 'retain-operational',
  purpose: 'Test operational control.',
  intendedAudience: 'All clients.',
  safeDefault: true,
  cleanupNote: 'Review at test lifecycle review.',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  permanentJustification: 'Emergency safety control.',
};

describe('feature lifecycle policy', () => {
  it('keeps launched controls safe when a remote snapshot omits them', () => {
    expect(resolveFeatureFlagValue({}, 'isCommunityEnabled')).toBe(true);
    expect(resolveFeatureFlagValue({}, 'isSocialShieldEnabled')).toBe(true);
  });

  it('fails closed for beta and experiment flags with no remote value', () => {
    expect(fallbackForFeatureFlagClass('beta')).toBe(false);
    expect(fallbackForFeatureFlagClass('experiment')).toBe(false);
    expect(fallbackForFeatureFlagClass('release')).toBe(true);
    expect(resolveFeatureFlagValue({}, 'isAIAssistantEnabled')).toBe(false);
    expect(resolveFeatureFlagValue({ isAIAssistantEnabled: 'true' }, 'isAIAssistantEnabled')).toBe(
      true,
    );
    expect(resolveFeatureFlagValue({}, 'isUnderMaintenance')).toBe(false);
    expect(resolveFeatureFlagValue({}, 'isPowerSyncEnabled')).toBe(false);
  });

  it('preserves the manifest class for diagnostics', () => {
    expect(resolveFeatureFlagClass('isAIAssistantEnabled')).toBe('beta');
    expect(resolveFeatureFlagClass('isUnderMaintenance')).toBe('operational');
    expect(resolveFeatureFlagClass('unknown.flag')).toBe('operational');
  });

  it('rejects contradictory class and disposition metadata', () => {
    expect(() =>
      FeatureFlagMetadataSchema.parse({
        ...releaseMetadata,
        class: 'release',
        disposition: 'retain-operational',
      }),
    ).toThrow('Flag class and lifecycle disposition must agree');
  });

  it('allows archival only after code and catalog references reach zero', () => {
    expect(() =>
      validateFeatureLifecycleAction(releaseMetadata, {
        kind: 'archive-growthbook-flag',
        key: 'test.release',
        codeReferences: 0,
        catalogReferences: 0,
        reason: 'Release branch was removed after general availability.',
      }),
    ).not.toThrow();
  });

  it('rejects archival while references remain', () => {
    expect(() =>
      validateFeatureLifecycleAction(releaseMetadata, {
        kind: 'archive-growthbook-flag',
        key: 'test.release',
        codeReferences: 1,
        catalogReferences: 0,
        reason: 'Attempted early cleanup.',
      }),
    ).toThrow('code and catalog references are zero');
  });

  it('requires the manifest justification for operational retention', () => {
    expect(() =>
      validateFeatureLifecycleAction(operationalMetadata, {
        kind: 'retain-operational-control',
        key: 'test.operational',
        permanentJustification: 'Different text.',
      }),
    ).toThrow('does not match the manifest');
  });
});
