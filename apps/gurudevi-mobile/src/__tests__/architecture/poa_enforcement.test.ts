import { lessonsAPI } from '@repo/core/api';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase } from '@repo/core/api/supabase';
import { useStore } from '@repo/core/logic';
import type { TotalState } from '@repo/core/store';
import { selfAPI } from '@repo/self/api';
import { afterEach, describe, expect, it, vi } from 'vitest';

const TEACHER_ID = '11111111-1111-4111-8111-111111111111';
const SCHOOL_ID = '22222222-2222-4222-8222-222222222222';

describe('POA enforcement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws Forbidden before lessonsAPI.create reaches Supabase without capacity', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: null,
      schoolType: null,
    } as unknown as TotalState);

    const fromSpy = vi.spyOn(supabase, 'from');

    await expect(
      lessonsAPI.create({
        title: 'Forbidden Lesson',
        classroom_id: SCHOOL_ID,
        teacher_id: TEACHER_ID,
      }),
    ).rejects.toThrow('Access Denied');

    expect(fromSpy).not.toHaveBeenCalled();
  });

  it('denies selfAPI.getMoodHistory for guests according to the contract and composer', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: null,
      schoolType: null,
    } as unknown as TotalState);

    const fetchSpy = vi.spyOn(global, 'fetch');

    await expect(selfAPI.getMoodHistory(TEACHER_ID)).rejects.toThrow('Forbidden');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('allows selfAPI.getMoodHistory for an authenticated teacher and reaches Remote API', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: {
        id: TEACHER_ID,
        email: 'teacher@example.com',
        capacitys: ['teacher'],
        capacity: 'teacher',
        school_id: SCHOOL_ID,
        is_anonymous: false,
      },
      schoolType: 'school_workspace',
    } as unknown as TotalState);

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as any);

    await expect(selfAPI.getMoodHistory(TEACHER_ID)).resolves.toEqual([]);

    expect(fetchSpy).toHaveBeenCalled();
    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall).toBeDefined();
    expect(fetchCall![0].toString()).toContain('/self/mood');
  });
});
