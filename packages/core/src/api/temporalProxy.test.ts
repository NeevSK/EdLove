import { createTemporalProxy } from '@repo/core/api/temporalProxy';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';

describe('createTemporalProxy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useTemporalStore.getState().resetToToday();
    useTemporalStore.setState({ readPolicy: 'live', viewScale: 'day' });
  });

  test('blocks mutations while viewing the past', async () => {
    useTemporalStore.setState({ phase: 'past', isPastView: true });

    const proxy = createTemporalProxy('demo', {
      updateThing: async () => 'updated',
    });

    await expect(proxy.updateThing()).rejects.toThrow('Cannot modify history');
  });

  test('allows mutations in present phase', async () => {
    useTemporalStore.setState({ phase: 'present', isPastView: false });

    const proxy = createTemporalProxy('demo', {
      updateThing: async () => 'updated',
    });

    await expect(proxy.updateThing()).resolves.toBe('updated');
  });

  test('a saved mutation uses the current admission and never the phase at lookup', async () => {
    const updateThing = vi.fn(async () => 'updated');
    useTemporalStore.setState({ phase: 'present' });
    const proxy = createTemporalProxy('demo', { updateThing });
    const savedUpdate = proxy.updateThing;

    useTemporalStore.setState({ phase: 'past' });
    await expect(savedUpdate()).rejects.toThrow('Cannot modify history');
    expect(updateThing).not.toHaveBeenCalled();

    useTemporalStore.setState({ phase: 'present' });
    await expect(savedUpdate()).resolves.toBe('updated');
    expect(updateThing).toHaveBeenCalledTimes(1);
  });

  test('a saved read uses the current cached-read policy and date coordinates', async () => {
    const getItem = vi.spyOn(SafeZustandStorage, 'getItem').mockResolvedValue('["retained"]');
    const getThing = vi.fn(async () => ({ data: ['live'] }));
    const proxy = createTemporalProxy('demo', { getThing });
    const savedRead = proxy.getThing;
    useTemporalStore.setState({
      readPolicy: 'cached-only',
      viewDate: '2026-10-25',
      viewScale: 'week',
    });

    await expect(savedRead()).resolves.toEqual({ data: ['retained'], error: null });
    expect(getItem).toHaveBeenCalledWith('offline-demo-getThing-2026-10-25-week');
    expect(getThing).not.toHaveBeenCalled();

    useTemporalStore.setState({ readPolicy: 'live' });
    await expect(savedRead()).resolves.toEqual({ data: ['live'] });
    expect(getThing).toHaveBeenCalledTimes(1);
  });

  test('preserves values, symbol properties and method receiver binding', async () => {
    const marker = Symbol('marker');
    const target = {
      value: 42,
      [marker]: 'retained',
      async getThing() {
        return this.value;
      },
    };
    const proxy = createTemporalProxy('demo', target);
    expect(proxy.value).toBe(42);
    expect(proxy[marker]).toBe('retained');
    await expect(proxy.getThing()).resolves.toBe(42);
  });

  test('uses canonical temporal cache keys for offline reads', async () => {
    const getItemSpy = vi.spyOn(SafeZustandStorage, 'getItem').mockResolvedValue('[]');

    useTemporalStore.setState({
      phase: 'present',
      readPolicy: 'cached-only',
      viewDate: '2026-03-27',
      viewScale: 'month',
    });

    const proxy = createTemporalProxy('demo', {
      getThing: async () => ({ data: ['live'] }),
    });

    await proxy.getThing();

    expect(getItemSpy).toHaveBeenCalledWith('offline-demo-getThing-2026-03-27-month');
  });
});
