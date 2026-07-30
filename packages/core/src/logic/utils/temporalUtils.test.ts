import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { applyTemporalFilter, getTemporalRange } from '@repo/core/logic/utils/temporalUtils';

describe('temporalUtils', () => {
  afterEach(() => {
    useTemporalStore.getState().resetToToday();
    useTemporalStore.setState({ viewScale: 'day' });
  });

  test('getTemporalRange returns a bounded day range', () => {
    const range = getTemporalRange('2026-03-27', 'day');

    expect(range.start).toContain('2026-03-27T00:00:00');
    expect(range.end).toContain('2026-03-27T23:59:59');
  });

  test('applyTemporalFilter uses requested column and event-time bounds', () => {
    const calls: Array<[string, string]> = [];
    const query = {
      gte: vi.fn((column: string, value: string) => {
        calls.push(['gte', `${column}:${value}`]);
        return query;
      }),
      lte: vi.fn((column: string, value: string) => {
        calls.push(['lte', `${column}:${value}`]);
        return query;
      }),
    } as any;

    useTemporalStore.setState({
      viewDate: '2026-03-27',
      phase: 'past',
      viewScale: 'week',
    });

    applyTemporalFilter(query, {
      column: 'created_at',
      mode: 'event_time',
      capability: 'event_stream',
    });

    expect(calls[0]?.[1]).toContain('created_at:2026-03');
    expect(calls[1]?.[1]).toContain('created_at:2026-03');
  });

  test('applyTemporalFilter uses business-date semantics for date facts', () => {
    const calls: Array<[string, string]> = [];
    const query = {
      gte: vi.fn((column: string, value: string) => {
        calls.push(['gte', `${column}:${value}`]);
        return query;
      }),
      lte: vi.fn((column: string, value: string) => {
        calls.push(['lte', `${column}:${value}`]);
        return query;
      }),
    } as any;

    useTemporalStore.setState({
      viewDate: '2026-03-27',
      phase: 'past',
      viewScale: 'month',
    });

    applyTemporalFilter(query, {
      column: 'date',
      mode: 'business_date',
      capability: 'business_fact',
    });

    expect(calls[0]?.[1]).toBe('date:2026-03-01');
    expect(calls[1]?.[1]).toBe('date:2026-03-31');
  });

  test('present snapshot queries are left untouched', () => {
    const query = {
      gte: vi.fn(),
      lte: vi.fn(),
    } as any;

    useTemporalStore.setState({
      viewDate: '2026-03-27',
      phase: 'present',
      viewScale: 'day',
    });

    const result = applyTemporalFilter(query, {
      column: 'created_at',
      mode: 'event_time',
      capability: 'snapshot',
    });

    expect(result).toBe(query);
    expect(query.gte).not.toHaveBeenCalled();
    expect(query.lte).not.toHaveBeenCalled();
  });
});
