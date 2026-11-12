import { beforeEach, describe, expect, it, vi } from 'vitest';

const request = vi.hoisted(() => vi.fn());
vi.mock('./selfApiClient', () => ({ requestAccountSelfProcedure: request }));

import { loadMoodHistory } from './selfWellbeing';

const entry = (mood: unknown, id = 'm1') => ({
  id,
  user_id: 'u1',
  mood_score: 4,
  mood,
  note: null,
  created_at: '2026-11-12T00:00:00.000Z',
});

describe('loadMoodHistory', () => {
  beforeEach(() => request.mockReset());

  it('keeps readable entries and skips one with a mood this app does not know', async () => {
    request.mockResolvedValue([entry('calm', 'a'), entry('elated', 'b'), entry(null, 'c')]);
    const history = await loadMoodHistory();
    expect(history.map((h) => h.id)).toEqual(['a', 'c']);
  });

  it('still treats a response that is not a list as invalid', async () => {
    request.mockResolvedValue([]);
    await loadMoodHistory();
    const [, , isValid] = request.mock.calls[0] as [string, unknown, (v: unknown) => boolean];
    expect(isValid({ not: 'a list' })).toBe(false);
    expect(isValid([])).toBe(true);
  });
});
