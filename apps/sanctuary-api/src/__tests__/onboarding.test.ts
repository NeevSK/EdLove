import './setup';
import { describe, expect, it, beforeEach } from 'vitest';
import { app } from '../core/app.js';
import {
  setMockActiveBond,
  setMockUserData,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: Onboarding Endpoints', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';

  // JWT bypass token: UUID format triggers integration test bypass in verifySupabaseJwt
  const userToken = '123e4567-e89b-12d3-a456-426614174000';
  const authenticatedHeaders = {
    Authorization: `Bearer ${userToken}`,
    'Content-Type': 'application/json',
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

  const validCompleteOnboardingPayload = {
    userId,
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

  describe('POST /api/identity/initial-bond', () => {
    it('should return 200 for a valid onboarding request', async () => {
      setMockUserData(defaultMockUser);

      const res = await app.request('/api/identity/initial-bond', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(validInitialBondPayload),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
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

      const res = await app.request('/api/identity/initial-bond', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(validInitialBondPayload),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('should return 400 for invalid request body', async () => {
      setMockUserData(defaultMockUser);

      const res = await app.request('/api/identity/initial-bond', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify({ orientation: '' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/identity/complete-onboarding', () => {
    it('should return 200 and complete onboarding when bonds exist', async () => {
      setMockUserData(defaultMockUser);
      setMockActiveBond({ capacity: 'teacher', entity_type: 'PLATFORM', entity_id: 'GLOBAL' });

      const res = await app.request('/api/identity/complete-onboarding', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(validCompleteOnboardingPayload),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('should return 200 and create default sanctuary when bonds are empty', async () => {
      setMockUserData({ ...defaultMockUser, capacity: 'teacher' });
      setMockActiveBond(null);

      const res = await app.request('/api/identity/complete-onboarding', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(validCompleteOnboardingPayload),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('should return 400 when user has no capacity and no bonds', async () => {
      setMockUserData({ ...defaultMockUser, capacity: null });
      setMockActiveBond(null);

      const res = await app.request('/api/identity/complete-onboarding', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify(validCompleteOnboardingPayload),
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid request body', async () => {
      const res = await app.request('/api/identity/complete-onboarding', {
        method: 'POST',
        headers: authenticatedHeaders,
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });
});
