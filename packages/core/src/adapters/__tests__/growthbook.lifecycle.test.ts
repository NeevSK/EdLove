import { setPolyfills } from '@growthbook/growthbook';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import { UserContextSchema } from '@repo/core/logic/schemas/user.schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';

const fixture = vi.hoisted(() => ({
  status: 'online' as 'unknown' | 'online' | 'offline',
  listeners: new Set<() => void>(),
  records: new Map<string, string>(),
}));
vi.mock('@repo/core/logic/managers/NetworkManager', () => ({
  networkManager: {
    getSnapshot: () => ({ status: fixture.status }),
    subscribe: (listener: () => void) => {
      fixture.listeners.add(listener);
      return () => {
        fixture.listeners.delete(listener);
      };
    },
  },
}));
vi.mock('@repo/core/lib/storage', () => ({
  storage: {
    getStringAsync: async (key: string) => fixture.records.get(key),
    setAsync: async (key: string, value: string) => {
      fixture.records.set(key, value);
    },
  },
}));
vi.mock('@repo/core/monitoring', () => ({ trackProductEvent: vi.fn() }));

const pollInterval = 15 * 60 * 1000;
const context = UserContextSchema.parse({ userId: 'account-a', pricing_tier: 'PRO' });
const payload = {
  dateUpdated: '2026-01-01T00:00:00.000Z',
  features: { 'gurudevi.core.graphics-engine': { defaultValue: false } },
};
const networkFetch = vi.fn<typeof fetch>();
let key = 0;
const adapter = () =>
  new GrowthBookFeatureRolloutAdapter('https://unused.invalid', `lifecycle-${key++}`);
function network(status: typeof fixture.status) {
  fixture.status = status;
  for (const listener of fixture.listeners) listener();
}
const stops: (() => void)[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T00:00:00Z'));
  fixture.status = 'online';
  fixture.listeners.clear();
  fixture.records.clear();
  networkFetch.mockReset();
  networkFetch.mockImplementation(
    async () => new Response(JSON.stringify(payload), { status: 200 }),
  );
  setPolyfills({ fetch: networkFetch });
});
afterEach(() => {
  for (const stop of stops.splice(0)) stop();
  setPolyfills({ fetch: globalThis.fetch });
  vi.useRealTimers();
});

describe('Feature payload lifecycle (installed GrowthBook, HTTP/storage/network observation substituted)', () => {
  it('does not load for unknown/offline state and loads on observed reconnect', async () => {
    network('unknown');
    const service = adapter();
    const listener = vi.fn();
    stops.push(service.subscribeToFlagChanges(context, listener));
    const unknown = await service.resolveFlags(context);
    expect(unknown.source).toBe('computed');
    expect(Date.parse(unknown.refreshedAt)).toBe(0);
    expect(networkFetch).not.toHaveBeenCalled();
    network('offline');
    await vi.advanceTimersByTimeAsync(pollInterval * 2);
    expect(networkFetch).not.toHaveBeenCalled();
    network('online');
    await vi.waitFor(() => expect(listener).toHaveBeenCalled());
    expect(networkFetch).toHaveBeenCalledTimes(1);
    expect(listener.mock.lastCall?.[0].source).toBe('remote');
    expect(listener.mock.lastCall?.[0].flags.isGraphicsEngineEnabled).toBe(false);
  });
  it('does not renew network freshness when attributes change', async () => {
    const service = adapter();
    const first = await service.resolveFlags(context);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    const second = await service.resolveFlags(
      UserContextSchema.parse({ userId: 'account-b', pricing_tier: 'FREE' }),
    );
    expect(second.refreshedAt).toBe(first.refreshedAt);
    expect(second.source).toBe('remote');
    expect(networkFetch).toHaveBeenCalledTimes(1);
  });
  it('verifies an unchanged old-version payload again without using its content modification date as fetch time', async () => {
    const service = adapter();
    const first = await service.resolveFlags(context);
    expect(first.refreshedAt).not.toBe(payload.dateUpdated);
    await vi.advanceTimersByTimeAsync(pollInterval);
    const second = await service.resolveFlags(context);
    expect(second.flags).toEqual(first.flags);
    expect(Date.parse(second.refreshedAt) - Date.parse(first.refreshedAt)).toBe(pollInterval);
    expect(networkFetch).toHaveBeenCalledTimes(2);
  });
  it('keeps the previous payload and timestamp after 503', async () => {
    const service = adapter();
    const first = await service.resolveFlags(context);
    networkFetch.mockImplementation(async () => new Response('unavailable', { status: 503 }));
    await vi.advanceTimersByTimeAsync(pollInterval);
    await expect(service.resolveFlags(context)).rejects.toThrow(
      'did not receive a new network response',
    );
    network('offline');
    const retained = await service.resolveFlags(context);
    expect(retained.flags).toEqual(first.flags);
    expect(retained.refreshedAt).toBe(first.refreshedAt);
  });
  it('does not adopt a response that arrives after the SDK request timeout', async () => {
    const service = adapter();
    const first = await service.resolveFlags(context);
    let complete!: (response: Response) => void;
    networkFetch.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    await vi.advanceTimersByTimeAsync(pollInterval);
    const attempt = service.resolveFlags(context);
    const rejection = expect(attempt).rejects.toThrow('did not receive a new network response');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    network('offline');
    complete(
      new Response(
        JSON.stringify({ features: { 'gurudevi.core.graphics-engine': { defaultValue: true } } }),
        { status: 200 },
      ),
    );
    await vi.advanceTimersByTimeAsync(1);
    const retained = await service.resolveFlags(context);
    expect(retained.flags).toEqual(first.flags);
    expect(retained.refreshedAt).toBe(first.refreshedAt);
  });
  it('does not postpone the payload deadline when a subscriber or online event arrives later', async () => {
    const service = adapter();
    await service.resolveFlags(context);
    await vi.advanceTimersByTimeAsync(pollInterval - 60_000);
    stops.push(service.subscribeToFlagChanges(context, vi.fn()));
    network('online');
    await vi.advanceTimersByTimeAsync(60_000);
    expect(networkFetch).toHaveBeenCalledTimes(2);
  });
  it('backs off a failed owned poll instead of spinning at an expired freshness deadline', async () => {
    const service = adapter();
    stops.push(service.subscribeToFlagChanges(context, vi.fn()));
    await service.resolveFlags(context);
    networkFetch.mockImplementation(async () => new Response('unavailable', { status: 503 }));
    await vi.advanceTimersByTimeAsync(pollInterval);
    expect(networkFetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(networkFetch).toHaveBeenCalledTimes(2);
  });
  it('recovers after an initial failed load without treating an empty SDK payload as fresh', async () => {
    const service = adapter();
    networkFetch.mockImplementationOnce(async () => new Response('unavailable', { status: 503 }));
    await expect(service.resolveFlags(context)).rejects.toThrow();
    network('offline');
    const failed = await service.resolveFlags(context);
    expect(failed.source).toBe('computed');
    expect(Date.parse(failed.refreshedAt)).toBe(0);
    network('online');
    const recovered = await service.resolveFlags(context);
    expect(recovered.source).toBe('remote');
    expect(recovered.flags.isGraphicsEngineEnabled).toBe(false);
  });
  it('polls only while owned and online, then releases its timer and network listener', async () => {
    const service = adapter();
    const listener = vi.fn();
    const stop = service.subscribeToFlagChanges(context, listener);
    stops.push(stop);
    await service.resolveFlags(context);
    expect(networkFetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(pollInterval);
    expect(networkFetch).toHaveBeenCalledTimes(2);
    network('offline');
    await vi.advanceTimersByTimeAsync(pollInterval * 2);
    expect(networkFetch).toHaveBeenCalledTimes(2);
    stop();
    expect(fixture.listeners.size).toBe(0);
    network('online');
    await vi.advanceTimersByTimeAsync(pollInterval);
    expect(networkFetch).toHaveBeenCalledTimes(2);
  });
  it('does not publish an in-flight refresh or schedule another poll after disposal', async () => {
    let complete!: (response: Response) => void;
    networkFetch.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    const service = adapter();
    const listener = vi.fn<(snapshot: FeatureRolloutSnapshot) => void>();
    const stop = service.subscribeToFlagChanges(context, listener);
    stops.push(stop);
    const pending = service.resolveFlags(context);
    await vi.waitFor(() => expect(networkFetch).toHaveBeenCalledTimes(1));
    stop();
    complete(new Response(JSON.stringify(payload), { status: 200 }));
    await pending;
    await vi.advanceTimersByTimeAsync(pollInterval * 2);
    expect(listener).not.toHaveBeenCalled();
    expect(networkFetch).toHaveBeenCalledTimes(1);
  });
});
