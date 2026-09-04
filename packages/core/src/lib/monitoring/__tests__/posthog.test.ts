import { injectPostHog, resetUser, trackProductEvent } from '@repo/core/monitoring';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('PostHog product analytics bridge', () => {
  afterEach(() => {
    resetUser();
    injectPostHog(null as never);
  });

  it('sends typed context and strips identifiers before the provider', () => {
    const capture = vi.fn();
    injectPostHog({
      capture,
      identify: vi.fn(),
      screen: vi.fn(),
      reset: vi.fn(),
    });

    trackProductEvent(
      'feature_opened',
      { feature_id: 'attendance' },
      {
        platform: 'web',
        active_capacity: 'teacher',
        school_type: 'secondary',
        analytics_schema_version: 1,
      },
    );

    expect(capture).toHaveBeenCalledWith('feature_opened', {
      feature_id: 'attendance',
      platform: 'web',
      active_capacity: 'teacher',
      school_type: 'secondary',
      analytics_schema_version: 1,
    });
  });

  it('remains best-effort when no provider is injected', () => {
    expect(() => trackProductEvent('app_started')).not.toThrow();
  });
});
