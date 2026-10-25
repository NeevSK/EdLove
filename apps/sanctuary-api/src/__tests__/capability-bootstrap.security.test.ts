import './setup';
import type { AuthRequest } from '@repo/policies';
import { check } from '@repo/policies';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../core/app';
import { isOnboardingBootstrapProcedure } from '../core/onboardingBootstrap';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockUserData,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

vi.mock('@repo/policies', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/policies')>()),
  check: vi.fn(() => ({ permitted: true })),
}));

const userId = '123e4567-e89b-8101-8000-426614174000';
const bondId = '123e4567-e89b-12d3-a456-426614174001';
const headers = { Authorization: `Bearer ${userId}` };
const query = { domain: 'self', platform: 'browser' } as const;
const policyCheck = vi.mocked(check);

describe('live capability bootstrap security boundary', () => {
  beforeEach(() => {
    policyCheck.mockReset();
    policyCheck.mockImplementation(() => ({ permitted: true }));
    setMockZenStackDbAvailable(true);
    setMockUserData({ id: userId, full_name: 'Synthetic Citizen', onboarding_completed: true });
    setMockUserPreferences({ active_bond_id: bondId });
    setMockActiveBond({
      id: bondId,
      user_id: userId,
      entity_id: '123e4567-e89b-8101-8000-426614174002',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
      valid_from: new Date('2020-01-01T00:00:00.000Z'),
      valid_until: null,
      metadata: null,
    });
  });

  it('does not advertise create solely because read is permitted', async () => {
    policyCheck.mockImplementation((request: AuthRequest) => ({
      permitted: request.action !== 'create',
    }));
    const result = await createTestORPCClient(headers).identity.capabilityBootstrap({ query });
    expect(result.features).toEqual([
      expect.objectContaining({
        id: 'fire_journal',
        status: 'available',
        allowedOperations: ['read'],
      }),
      expect.objectContaining({
        id: 'mood_lotus',
        status: 'available',
        allowedOperations: ['read'],
      }),
    ]);
    expect(policyCheck.mock.calls.some(([request]) => request.action === 'create')).toBe(true);
    await expect(
      createTestORPCClient(headers).self.burnJournal({ body: { content: 'Synthetic draft' } }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('preserves both operations when both are permitted', async () => {
    const result = await createTestORPCClient(headers).identity.capabilityBootstrap({ query });
    expect(result.features).toEqual([
      expect.objectContaining({ id: 'fire_journal', allowedOperations: ['read', 'create'] }),
      expect.objectContaining({ id: 'mood_lotus', allowedOperations: ['read', 'create'] }),
    ]);
  });

  it('locks the feature when entry read is denied even if create could be permitted', async () => {
    policyCheck.mockImplementation((request: AuthRequest) => ({
      permitted: request.action === 'create',
    }));
    const result = await createTestORPCClient(headers).identity.capabilityBootstrap({ query });
    expect(result.features).toEqual([
      expect.objectContaining({
        id: 'fire_journal',
        status: 'locked',
        reason: 'authorization_denied',
        allowedOperations: [],
      }),
      expect.objectContaining({
        id: 'mood_lotus',
        status: 'locked',
        reason: 'authorization_denied',
        allowedOperations: [],
      }),
    ]);
  });

  it('allows authenticated no-scope native discovery, not protected Self data', async () => {
    setMockActiveBond(null);
    setMockUserPreferences({ active_bond_id: null });
    const result = await createTestORPCClient(headers).identity.capabilityBootstrap({ query });
    expect(result.subjectId).toBe(userId);
    expect(result.scopeBootstrap.activeScope).toBeNull();
    expect(result.features).toEqual([
      expect.objectContaining({
        status: 'locked',
        reason: 'scope_required',
        allowedOperations: [],
      }),
      expect.objectContaining({
        status: 'locked',
        reason: 'scope_required',
        allowedOperations: [],
      }),
    ]);
    await expect(
      createTestORPCClient(headers).self.getJournalHistory({ query: { limit: 10 } }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('allows only the exact no-scope OpenAPI discovery path', async () => {
    setMockActiveBond(null);
    setMockUserPreferences({ active_bond_id: null });
    const response = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser',
      { headers },
    );
    expect(response.status, await response.clone().text()).toBe(200);
    expect(await response.json()).toMatchObject({
      subjectId: userId,
      scopeBootstrap: { activeScope: null },
    });
    expect(isOnboardingBootstrapProcedure('/api/identity/capabilityBootstrap')).toBe(true);
    expect(isOnboardingBootstrapProcedure('/api/openapi/capabilities/bootstrap/v1')).toBe(true);
    expect(isOnboardingBootstrapProcedure('/api/identity/capabilityBootstrap/other')).toBe(false);
    expect(isOnboardingBootstrapProcedure('/api/self/burnJournal')).toBe(false);
  });

  it('does not make account discovery anonymous through either transport', async () => {
    const response = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser',
    );
    expect(response.status).toBe(401);
    await expect(
      createTestORPCClient().identity.capabilityBootstrap({ query }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('does not treat client Explore mode or a fictional role as live authority', async () => {
    await expect(
      createTestORPCClient().self.burnJournal({
        body: { content: 'Synthetic practice', mode: 'explore', capacity: 'principal' },
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      createTestORPCClient().self.burnJournal({ body: { content: 'Synthetic practice' } }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('fails closed when the authoritative database is unavailable', async () => {
    setMockZenStackDbAvailable(false);
    await expect(
      createTestORPCClient(headers).identity.capabilityBootstrap({ query }),
    ).rejects.toBeDefined();
  });

  it('denies anonymous discovery before database availability becomes relevant', async () => {
    setMockZenStackDbAvailable(false);
    await expect(
      createTestORPCClient().identity.capabilityBootstrap({ query }),
    ).rejects.toMatchObject({ status: 401 });
    const response = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser',
    );
    expect(response.status).toBe(401);
  });

  it('uses the persisted teacher scope despite forged role and school headers', async () => {
    policyCheck.mockImplementation((request: AuthRequest) => ({
      permitted: request.action === 'read' || request.principal.attributes.capacity === 'principal',
    }));
    const result = await createTestORPCClient({
      ...headers,
      'X-Capacity': 'principal',
      'X-School-Id': 'another-school',
    }).identity.capabilityBootstrap({ query });
    expect(result.features).toEqual([
      expect.objectContaining({ allowedOperations: ['read'] }),
      expect.objectContaining({ allowedOperations: ['read'] }),
    ]);
    expect(policyCheck.mock.calls.filter(([request]) => request.action === 'create')).toEqual([
      [
        expect.objectContaining({
          principal: expect.objectContaining({
            attributes: expect.objectContaining({
              capacity: 'teacher',
              school_id: '123e4567-e89b-8101-8000-426614174002',
            }),
          }),
        }),
      ],
      [
        expect.objectContaining({
          principal: expect.objectContaining({
            attributes: expect.objectContaining({
              capacity: 'teacher',
              school_id: '123e4567-e89b-8101-8000-426614174002',
            }),
          }),
        }),
      ],
    ]);
  });

  it('accepts canonical OpenAPI query fields and rejects wrapped or conflicting selectors', async () => {
    const response = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser',
      { headers },
    );
    expect(response.status, await response.clone().text()).toBe(200);
    expect(await response.json()).toMatchObject({ subjectId: userId });
    const wrapped = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?query[domain]=self&query[platform]=browser',
      { headers },
    );
    expect(wrapped.status).toBe(400);
    const conflict = await app.request(
      '/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser&query[domain]=workspace&query[platform]=browser',
      { headers },
    );
    expect(conflict.status).toBe(400);
  });
});
