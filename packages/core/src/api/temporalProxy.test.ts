import { SafeZustandStorage } from '@/lib/storageWrapper';
import { useTemporalStore } from '@/store/useTemporalStore';
import { createTemporalProxy } from '@/api/temporalProxy';

describe('createTemporalProxy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useTemporalStore.getState().resetToToday();
    useTemporalStore.setState({ isOffline: false, viewScale: 'day' });
  });

  test('blocks mutations while viewing the past', async () => {
    useTemporalStore.setState({ phase: 'past', isPastView: true });

    const proxy = createTemporalProxy('demo', {
      updateThing: async () => 'updated',
    });

    await expect((proxy as any).updateThing()).rejects.toThrow('Cannot modify history');
  });

  test('allows mutations in present phase', async () => {
    useTemporalStore.setState({ phase: 'present', isPastView: false });

    const proxy = createTemporalProxy('demo', {
      updateThing: async () => 'updated',
    });

    await expect((proxy as any).updateThing()).resolves.toBe('updated');
  });

  test('uses canonical temporal cache keys for offline reads', async () => {
    const getItemSpy = vi.spyOn(SafeZustandStorage, 'getItem').mockResolvedValue('[]');

    useTemporalStore.setState({
      phase: 'present',
      isOffline: true,
      viewDate: '2026-03-27',
      viewScale: 'month',
    });

    const proxy = createTemporalProxy('demo', {
      getThing: async () => ({ data: ['live'] }),
    });

    await (proxy as any).getThing();

    expect(getItemSpy).toHaveBeenCalledWith('offline-demo-getThing-2026-03-27-month');
  });
});
