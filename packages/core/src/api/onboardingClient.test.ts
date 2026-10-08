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
  userId: '123e4567-e89b-12d3-a456-426614174000',
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
    mocks.completeOnboarding.mockResolvedValue({ success: true });

    await expect(completeOnboarding()).resolves.toEqual({ success: true });
    expect(mocks.completeOnboarding).toHaveBeenCalledWith({});
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
