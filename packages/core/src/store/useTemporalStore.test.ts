import { useTemporalStore } from '@/store/useTemporalStore';

describe('useTemporalStore', () => {
  const today = new Date().toISOString().split('T')[0] || '';

  afterEach(() => {
    useTemporalStore.getState().resetToToday();
    useTemporalStore.setState({
      intensity: 1,
      isOffline: false,
      viewMode: 'spotlight',
      timelineFocus: 'all',
    });
  });

  test('initializes to today in present phase', () => {
    const state = useTemporalStore.getState();

    expect(state.viewDate).toBe(today);
    expect(state.phase).toBe('present');
    expect(state.isPastView).toBe(false);
  });

  test('setViewDate updates past and future phases correctly', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] || '';
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0] || '';

    useTemporalStore.getState().setViewDate(yesterday);
    expect(useTemporalStore.getState().phase).toBe('past');
    expect(useTemporalStore.getState().isPastView).toBe(true);

    useTemporalStore.getState().setViewDate(tomorrow);
    expect(useTemporalStore.getState().phase).toBe('future');
    expect(useTemporalStore.getState().isPastView).toBe(false);
  });

  test('resetToToday restores present defaults', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] || '';

    useTemporalStore.getState().setViewDate(yesterday);
    useTemporalStore.getState().setScale('month');
    useTemporalStore.getState().resetToToday();

    const state = useTemporalStore.getState();
    expect(state.viewDate).toBe(today);
    expect(state.phase).toBe('present');
    expect(state.viewScale).toBe('day');
    expect(state.isPastView).toBe(false);
  });

  test('scale, mode, focus, and offline setters update shared state', () => {
    const store = useTemporalStore.getState();

    store.setScale('year');
    store.setViewMode('timeline');
    store.setTimelineFocus('journal');
    store.setOffline(true);

    const state = useTemporalStore.getState();
    expect(state.viewScale).toBe('year');
    expect(state.viewMode).toBe('timeline');
    expect(state.timelineFocus).toBe('journal');
    expect(state.isOffline).toBe(true);
  });
});
