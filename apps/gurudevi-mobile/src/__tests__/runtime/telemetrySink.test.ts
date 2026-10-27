import { describe, expect, it, vi } from 'vitest';

const { injectPostHog } = await import('@repo/core/monitoring');
const { createVerger, GURUDEVI_MOBILE_HOST, UNKNOWN_CAPACITY } = await import('@repo/core/verger');
const { vergerTelemetrySink } = await import('@/runtime/telemetrySink');

describe("verger's telemetry through the app's analytics port", () => {
  it('arrives as one typed envelope, sanitized, with the policy kept under a catalog name', async () => {
    const capture = vi.fn();
    injectPostHog({ capture, identify: vi.fn(), screen: vi.fn(), reset: vi.fn() });
    const verger = createVerger({
      host: GURUDEVI_MOBILE_HOST,
      platform: () => ({
        readCapacity: () => UNKNOWN_CAPACITY,
        memorySensing: false,
        createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
      }),
      requested: 'active',
      release: '1',
      now: () => 0,
      telemetrySink: vergerTelemetrySink,
    });
    await verger.start();
    await verger.stop();
    const names = capture.mock.calls.map(([event, properties]) => [event, properties.verger_event]);
    expect(names.every(([event]) => event === 'verger_telemetry')).toBe(true);
    expect(names.map(([, name]) => name)).toEqual(expect.arrayContaining(['verger_launch', 'verger_outcomes']));
    for (const [, properties] of capture.mock.calls) {
      expect(properties).not.toHaveProperty('policy_id');
      expect(properties.policy_name).toBe(GURUDEVI_MOBILE_HOST.policy.id);
      expect(properties.analytics_schema_version).toBe(1);
      for (const value of Object.values(properties))
        expect(value === null || ['string', 'number', 'boolean'].includes(typeof value)).toBe(true);
    }
  });

  it('the field budget bounds a launch: few events, a summary every 15 minutes', () => {
    expect(GURUDEVI_MOBILE_HOST.config.telemetryMaxEvents).toBeLessThanOrEqual(24);
    expect(GURUDEVI_MOBILE_HOST.config.telemetryMaxSummaries).toBeLessThanOrEqual(4);
    expect(GURUDEVI_MOBILE_HOST.config.telemetrySummaryEveryMs).toBeGreaterThanOrEqual(15 * 60_000);
  });
});
