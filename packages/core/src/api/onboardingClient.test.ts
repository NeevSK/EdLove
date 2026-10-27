import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createInitialBond: vi.fn(),
  completeOnboarding: vi.fn(),
}));

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    onboarding: {
      createInitialBond: mocks.createInitialBond,
      completeOnboarding: mocks.completeOnboarding,
    },
  },
}));

import { completeOnboarding, createInitialBond } from './onboardingClient';

const scopeBootstrap = {
  version: 1 as const,
  userId: '123e4567-e89b-8101-8000-426614174000',
  name: 'Nila Sen',
  primaryCapacity: 'teacher',
  selection: 'selected' as const,
  activeScope: {
    bondId: '123e4567-e89b-12d3-a456-426614174001',
    entityId: 'personal-classroom',
    entityType: 'PERSONAL_CLASSROOM',
    roles: ['teacher'],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('canonical onboarding compatibility client', () => {
  it('sends the typed initial-bond body and validates the authoritative response', async () => {
    mocks.createInitialBond.mockResolvedValue({ success: true, scopeBootstrap });

    await expect(
      createInitialBond({
        orientation: 'teacher',
        confirmCapacityChange: false,
        context: { displayName: 'Nila Sen' },
      }),
    ).resolves.toEqual({ success: true, scopeBootstrap });

    expect(mocks.createInitialBond).toHaveBeenCalledWith({
      body: {
        orientation: 'teacher',
        confirmCapacityChange: false,
        context: { displayName: 'Nila Sen' },
      },
    });
  });

  it('completes onboarding without accepting a caller-selected user ID', async () => {
    mocks.completeOnboarding.mockResolvedValue({ success: true, receiptId: null, replayed: false });

    await expect(completeOnboarding()).resolves.toEqual({
      success: true,
      receiptId: null,
      replayed: false,
    });
    expect(mocks.completeOnboarding).toHaveBeenCalledWith({ body: {} });
  });

  it('propagates transport failures without converting them into success', async () => {
    const failure = new Error('service unavailable');
    mocks.createInitialBond.mockRejectedValue(failure);

    await expect(
      createInitialBond({
        orientation: 'teacher',
        confirmCapacityChange: false,
        context: { displayName: 'Nila Sen' },
      }),
    ).rejects.toMatchObject({
      _tag: 'OnboardingCommandError',
      operation: 'createInitialBond.request',
      cause: failure,
    });
  });

  it('retains captured-session context and completion intent through both Effect commands', async () => {
    const expectedSession = {
      accessToken: 'fixture-access',
      subject: 'f0560000-0000-4000-8000-000000000001',
    };
    const idempotencyKey = '123e4567-e89b-12d3-a456-426614174002';
    mocks.createInitialBond.mockResolvedValue({ success: true, scopeBootstrap });
    mocks.completeOnboarding.mockResolvedValue({ success: true, receiptId: null, replayed: false });
    const input = {
      orientation: 'teacher' as const,
      confirmCapacityChange: false,
      context: { displayName: 'Nila Sen' },
    };
    await createInitialBond(input, expectedSession);
    await completeOnboarding({ idempotencyKey }, expectedSession);
    expect(mocks.createInitialBond).toHaveBeenCalledWith(
      { body: input },
      { context: { expectedSession, retry: 0 } },
    );
    expect(mocks.completeOnboarding).toHaveBeenCalledWith(
      { body: { idempotencyKey } },
      { context: { expectedSession, retry: 0 } },
    );
  });

  it('rejects malformed server responses rather than guessing scope state', async () => {
    mocks.createInitialBond.mockResolvedValue({ success: true, scopeBootstrap: {} });

    await expect(
      createInitialBond({
        orientation: 'teacher',
        confirmCapacityChange: false,
        context: { displayName: 'Nila Sen' },
      }),
    ).rejects.toThrow();
  });
});
