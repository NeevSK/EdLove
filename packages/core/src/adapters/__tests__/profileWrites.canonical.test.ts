import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseProfileRepository } from '../supabase/profileRepository';
import { createZenStackProfileRepository } from '../zenstack/profileRepository';

const mock = vi.hoisted(() => ({ update: vi.fn(), from: vi.fn(), database: vi.fn() }));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { profile: { updateProfile: mock.update } },
}));
vi.mock('@repo/core/adapters/supabaseClient', () => ({ supabaseClient: { from: mock.from } }));
vi.mock('@repo/core/api/media', () => ({ mediaAPI: {} }));
vi.mock('@repo/database', () => ({ createZenStackDb: mock.database }));

const account = '123e4567-e89b-8101-8000-426614174000';
const fixture = {
  id: account,
  display_name: 'Teacher',
  full_name: 'Teacher',
  created_at: new Date().toISOString(),
};
const storage = { upload: vi.fn(), delete: vi.fn(), getPublicUrl: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  mock.update.mockResolvedValue(fixture);
  mock.from.mockImplementation(() => {
    throw new Error('Direct profile write forbidden');
  });
  mock.database.mockImplementation(() => {
    throw new Error('Direct database write forbidden');
  });
});

for (const [name, create] of [
  ['Supabase', () => createSupabaseProfileRepository()],
  ['ZenStack', () => createZenStackProfileRepository(() => ({ id: account }), storage)],
] as const) {
  describe(`G1 ${name} profile write transport`, () => {
    it('uses the account-bound API without table access or database construction', async () => {
      expect((await create().updateUserProfile(account, { bio: 'Teacher bio' })).id).toBe(account);
      expect(mock.update).toHaveBeenCalledWith(
        { params: { id: account }, body: { bio: 'Teacher bio' } },
        { context: { expectedAccountId: account, retry: 0 } },
      );
      expect(mock.from).not.toHaveBeenCalled();
      expect(mock.database).not.toHaveBeenCalled();
    });

    it('rejects authority fields before transport', async () => {
      await expect(create().updateUserProfile(account, { pricing_tier: 'PRO' })).rejects.toThrow();
      expect(mock.update).not.toHaveBeenCalled();
    });

    it('rejects another account in the acknowledged profile', async () => {
      mock.update.mockResolvedValueOnce({ ...fixture, id: '123e4567-e89b-8101-8000-426614174002' });
      await expect(
        create().updateUserProfile(account, { bio: 'Teacher bio' }),
      ).rejects.toMatchObject({ code: 'AUTH_ACCOUNT_MISMATCH' });
    });

    it('propagates unavailable service without falling back to a database write', async () => {
      mock.update.mockRejectedValueOnce(new Error('Synthetic 503'));
      await expect(create().updateUserProfile(account, { bio: 'Teacher bio' })).rejects.toThrow(
        'Synthetic 503',
      );
      expect(mock.from).not.toHaveBeenCalled();
      expect(mock.database).not.toHaveBeenCalled();
    });
  });
}
