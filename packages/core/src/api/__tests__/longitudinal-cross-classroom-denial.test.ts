import { describe, expect, it, vi } from 'vitest';
import { longitudinalAPI } from '../longitudinal';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@repo/core/api/base', () => ({
  SOVEREIGN_API_URL: 'http://sanctuary.test',
  createSovereignClient: () => ({
    api: { longitudinal: { student: { timeline: { $get: get } } } },
  }),
}));

const studentId = '00000000-0000-4000-8000-000000000001';

describe('student longitudinal cross-classroom authorization boundary', () => {
  it('surfaces a Sanctuary authorization failure instead of querying Supabase directly', async () => {
    get.mockResolvedValueOnce({ ok: false, status: 403, json: () => Promise.resolve({ error: 'forbidden' }) });
    const read = longitudinalAPI.getStudentTimeline(studentId, '2026-03-28T23:59:59.000Z');

    await expect(read).rejects.toThrow();
  });
});
