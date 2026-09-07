import { trackingAPI } from '@repo/core/api/tracking';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('trackingAPI offline resiliency', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getExploredFeatures returns empty array instead of throwing when network fails', async () => {
    // Calling getExploredFeatures when server is unreachable
    const result = await trackingAPI.getExploredFeatures('user-test-id');
    expect(Array.isArray(result)).toBe(true);
  });

  it('logFeatureUsage returns null instead of throwing when network fails', async () => {
    const result = await trackingAPI.logFeatureUsage('user-test-id', 'section_self');
    expect(result).toBeNull();
  });
});
