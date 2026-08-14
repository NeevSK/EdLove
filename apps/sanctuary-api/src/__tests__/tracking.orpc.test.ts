import './setup';
import { describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';

describe('tracking API', () => {
  it('rejects empty feature names before database access', async () => {
    await expect(
      createTestORPCClient().tracking.logFeatureUsage({ featureName: '   ' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('requires authentication for feature history reads', async () => {
    await expect(createTestORPCClient().tracking.listExploredFeatures()).rejects.toMatchObject({
      status: 403,
    });
  });
});
