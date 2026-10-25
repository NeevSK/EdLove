import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

const account = '123e4567-e89b-8101-8000-426614174000';
const otherAccount = '123e4567-e89b-8101-8000-426614174002';
const client = () => createTestORPCClient({ Authorization: `Bearer ${account}` });

beforeEach(() => {
  setMockZenStackDbAvailable(true);
  setMockUserData({
    id: account,
    display_name: 'Teacher',
    full_name: 'Teacher',
    onboarding_completed: false,
    is_anonymous: false,
  });
  setMockActiveBond({
    id: '123e4567-e89b-42d3-a456-426614174020',
    user_id: account,
    entity_id: 'school-fixture',
    entity_type: 'SCHOOL',
    capacity: 'teacher',
    status: 'active',
  });
});

describe('G1 profile write authority with substituted database', () => {
  it('rejects unauthenticated profile completion', async () => {
    await expect(
      createTestORPCClient().onboarding.completeProfile({ body: { display_name: 'Visitor' } }),
    ).rejects.toMatchObject({ status: 401 });
  });
  for (const [router, procedure] of [
    ['profile', 'updateProfile'],
    ['identity', 'modifyUserProfile'],
  ]) {
    it.each([
      { id: otherAccount },
      { citizenship: 'FIRST_CLASS' },
      { pricing_tier: 'PRO' },
      { capacity: 'admin' },
      { school_id: 'caller-school' },
      { onboarding_completed: true },
      { identity_state: 'verified' },
      { is_anonymous: false },
      { deleted_at: null },
      { escrowed_recovery_key: 'caller-key' },
      { metadata: { role: 'admin' } },
      { email: 'unverified@example.com' },
      { profile_completed: true },
    ])(`${router}.${procedure} rejects authority fields: %j`, async (body) => {
      await expect(
        client()[router][procedure]({ params: { id: account }, body }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it(`${router}.${procedure} rejects another account even with an authenticated actor`, async () => {
      await expect(
        client()[router][procedure]({ params: { id: otherAccount }, body: { bio: 'Changed' } }),
      ).rejects.toMatchObject({ status: 403 });
    });
  }

  it('accepts editable profile details through the existing profile endpoint', async () => {
    const result = await client().profile.updateProfile({
      params: { id: account },
      body: {
        display_name: 'Updated name',
        bio: 'Teacher profile',
        capacity_label: 'Physics teacher',
      },
    });
    expect(result).toMatchObject({
      display_name: 'Updated name',
      full_name: 'Updated name',
      capacity_label: 'Physics teacher',
    });
  });

  it('completes profile details through a dedicated actor-derived bootstrap command', async () => {
    setMockActiveBond(null);
    expect(
      await client().onboarding.completeProfile({
        body: { display_name: 'Updated name', first_name: 'Updated' },
      }),
    ).toEqual({ success: true });
    await expect(
      client().onboarding.completeProfile({
        body: { display_name: 'Name', onboarding_completed: true },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
