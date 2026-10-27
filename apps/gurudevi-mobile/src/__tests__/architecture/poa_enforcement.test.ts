import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { lessonsAPI } from '@repo/core/api/classroom';
import { selfContract } from '@repo/core/api/self.contract';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import { afterEach, describe, expect, it, vi } from 'vitest';

const TEACHER_ID = '11111111-1111-4111-8111-111111111111';
const SCHOOL_ID = '22222222-2222-4222-8222-222222222222';

describe('POA enforcement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws Forbidden before lessonsAPI.create reaches Supabase without capacity', async () => {
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      ...useAuthStore.getState(),
      user: null,
    });
    vi.spyOn(useTenantStore, 'getState').mockReturnValue({
      ...useTenantStore.getState(),
      schoolType: null,
    });

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

  it('keeps self procedures in the canonical native contract', () => {
    expect((selfContract as any).getMoodHistory).toBeTruthy();
    expect((selfContract as any).logMood).toBeTruthy();
  });
});
