import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createSchoolRepository } from '../educational/schoolRepository';

describe('G1 school creation scope authority', () => {
  const input = {
    name: 'School fixture',
    type: 'school',
    created_by: '123e4567-e89b-8101-8000-426614174000',
  };

  it('creates a school without granting its creator account scope or membership', async () => {
    const school = { id: 'd0310000-0000-4000-8000-000000000001', ...input };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify(school), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createClient('https://school.example.invalid', 'synthetic-test-key', {
      global: { fetch },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    expect(await createSchoolRepository(client).createSchool(input)).toEqual(school);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(fetch.mock.calls[0]?.[0])).toContain('/rest/v1/schools');
  });

  it('surfaces a rejected school insert without attempting an account write', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Forbidden', code: '42501' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createClient('https://school.example.invalid', 'synthetic-test-key', {
      global: { fetch },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await expect(createSchoolRepository(client).createSchool(input)).rejects.toMatchObject({
      code: '42501',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
