import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { onboardingORPCContract } from '@repo/core/api/onboarding.orpc.contract';
import { app } from '../core/app.js';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: Onboarding Endpoints via oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';

  // JWT bypass token: UUID format triggers integration test bypass in verifySupabaseJwt
  const userToken = '123e4567-e89b-12d3-a456-426614174000';
  const authenticatedHeaders = {
    Authorization: `Bearer ${userToken}`,
  };

  const validInitialBondPayload = {
    orientation: 'teacher',
    context: {
      displayName: 'Test Teacher',
      fullName: 'Test Teacher',
      username: 'testteacher',
      schoolId: null,
      metadata: {},
    },
  };

  const defaultMockUser = {
    id: userId,
    is_anonymous: false,
    display_name: 'Test Teacher',
    full_name: 'Test Teacher',
    capacity: 'teacher',
    onboarding_completed: false,
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond(null);
    setMockUserData(null);
  });

  describe('POST /api/onboarding/createInitialBond', () => {
    it('should return 200 for a valid onboarding request', async () => {
      setMockUserData(defaultMockUser);

      const body = await createTestORPCClient(authenticatedHeaders).onboarding.createInitialBond({
        body: validInitialBondPayload,
      });
      expect(body.success).toBe(true);
    });

    it('should return 200 when bond already exists (idempotent)', async () => {
      setMockUserData(defaultMockUser);
      setMockActiveBond({
        id: 'existing-bond',
        capacity: 'teacher',
        entity_type: 'PLATFORM',
        entity_id: 'GLOBAL',
      });

      const body = await createTestORPCClient(authenticatedHeaders).onboarding.createInitialBond({
        body: validInitialBondPayload,
      });
      expect(body.success).toBe(true);
    });

    it('should return 400 for invalid request body', async () => {
      setMockUserData(defaultMockUser);

      const res = await app.request('/api/onboarding/createInitialBond', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify({ orientation: '' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/onboarding/completeOnboarding', () => {
    it('should return 200 and complete onboarding when bonds exist', async () => {
      setMockUserData(defaultMockUser);
      setMockActiveBond({ capacity: 'teacher', entity_type: 'PLATFORM', entity_id: 'GLOBAL' });

      const body = await createTestORPCClient(authenticatedHeaders).onboarding.completeOnboarding(
        {},
      );
      expect(body.success).toBe(true);
    });

    it('should return 200 and create default sanctuary when bonds are empty', async () => {
      setMockUserData({ ...defaultMockUser, capacity: 'teacher' });
      setMockActiveBond(null);

      const body = await createTestORPCClient(authenticatedHeaders).onboarding.completeOnboarding(
        {},
      );
      expect(body.success).toBe(true);
    });

    it('should return 400 when user has no capacity and no bonds', async () => {
      setMockUserData({ ...defaultMockUser, capacity: null });
      setMockActiveBond(null);

      await expect(
        createTestORPCClient(authenticatedHeaders).onboarding.completeOnboarding({}),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('does not accept a caller-selected identity in the completion contract', () => {
      expect(onboardingORPCContract.completeOnboarding.request).toBeUndefined();
    });
  });
});
