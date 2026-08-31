import { SELF_REGISTRY } from '@repo/self/constants/selfRegistry';
import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const rendererSource = readFileSync(
  resolve(import.meta.dirname, '../../components/SelfFeatureRenderer.tsx'),
  'utf8',
);

describe('Self registry to renderer contract', () => {
  it('resolves every declared domain feature to a catalog definition', () => {
    const missing = Object.values(SELF_REGISTRY).flatMap((domain) =>
      (domain.presentation?.featureIds ?? []).filter((featureId) => !FEATURE_CATALOG[featureId]),
    );

    expect(missing).toEqual([]);
  });

  it('declares a lazy renderer for every catalog component', () => {
    const unmapped = Object.values(FEATURE_CATALOG)
      .map((feature) => feature.componentId)
      .filter((componentId, index, componentIds) => componentIds.indexOf(componentId) === index)
      .filter((componentId) => !rendererSource.includes(`${componentId}: React.lazy`));

    expect(unmapped).toEqual([]);
  });
});
