import { injectPostHog } from '@repo/core/monitoring';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeEfficiencyDecision } from './observability';

describe('efficiency observability', () => {
  afterEach(() => {
    injectPostHog(null as never);
  });

  it('records only bounded non-allow decisions and deduplicates bursts', () => {
    const capture = vi.fn();
    injectPostHog({
      capture,
      identify: vi.fn(),
      screen: vi.fn(),
      reset: vi.fn(),
    });

    observeEfficiencyDecision('analytics', 'defer', 'offline');
    observeEfficiencyDecision('analytics', 'defer', 'offline');
    observeEfficiencyDecision('analytics', 'allow', 'eligible');

    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(
      'efficiency_policy_decision',
      expect.objectContaining({
        operation: 'analytics',
        action: 'defer',
        reason: 'offline',
      }),
    );
  });

  it('contains analytics failures and bounds unknown reasons', () => {
    const capture = vi.fn(() => {
      throw new Error('analytics unavailable');
    });
    injectPostHog({ capture, identify: vi.fn(), screen: vi.fn(), reset: vi.fn() });

    expect(() =>
      observeEfficiencyDecision('analytics', 'defer', 'raw-device-detail'),
    ).not.toThrow();
    expect(capture).toHaveBeenCalledWith(
      'efficiency_policy_decision',
      expect.objectContaining({ reason: 'unknown_reason' }),
    );
  });
});
