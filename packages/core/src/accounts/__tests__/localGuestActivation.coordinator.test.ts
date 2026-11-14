import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  commitIdentityScopeSession: vi.fn(async () => undefined),
  getLocalGuestIdentity: vi.fn(),
  scopeSnapshot: null as null | {
    principalId: string;
    activeBond: { id: string; capacity: string } | null;
  },
  setUser: vi.fn(),
}));

vi.mock('@repo/core/store/scopeSessionCoordinator', () => ({
  commitIdentityScopeSession: mocks.commitIdentityScopeSession,
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ setUser: mocks.setUser }) },
}));
vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: { getState: () => ({ snapshot: mocks.scopeSnapshot }) },
}));
vi.mock('@repo/core/native/guestIdentity', () => ({
  getLocalGuestIdentity: mocks.getLocalGuestIdentity,
}));
vi.mock('@repo/core/native/localGuestSession', () => ({
  restoreLocalGuestSession: vi.fn(),
}));

import { activateLocalGuestSession } from '../localGuestActivation.coordinator';

describe('activateLocalGuestSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLocalGuestIdentity.mockResolvedValue({
      id: 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
      email: null,
      display_name: 'Maya',
      availableBonds: [
        {
          id: 'bond-local',
          user_id: 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
          entity_id: 'personal-local',
          entity_type: 'PERSONAL_CLASSROOM',
          capacity: 'student',
          status: 'active',
        },
      ],
      activeBond: {
        id: 'bond-local',
        user_id: 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
        entity_id: 'personal-local',
        entity_type: 'PERSONAL_CLASSROOM',
        capacity: 'student',
        status: 'active',
      },
      onboarding_completed: true,
      citizenship: 'THIRD_CLASS',
    });
    mocks.scopeSnapshot = null;
  });

  it('hydrates the app identity and personal bond without a remote session', async () => {
    const session = {
      version: 1 as const,
      id: 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
    };

    await expect(activateLocalGuestSession(session)).resolves.toMatchObject({ session });
    expect(mocks.setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: session.id,
        display_name: 'Maya',
        citizenship: 'THIRD_CLASS',
        is_anonymous: true,
        onboarding_completed: true,
        capacity: 'student',
      }),
    );
    expect(mocks.commitIdentityScopeSession).toHaveBeenCalledWith({
      principalId: session.id,
      availableBonds: [expect.objectContaining({ id: 'bond-local', capacity: 'student' })],
      selectedBond: expect.objectContaining({ id: 'bond-local', capacity: 'student' }),
    });
  });

  it('does not create an identity when there is no local guest session', async () => {
    await expect(activateLocalGuestSession(null)).resolves.toBeNull();
    expect(mocks.getLocalGuestIdentity).not.toHaveBeenCalled();
    expect(mocks.setUser).not.toHaveBeenCalled();
  });

  it('coalesces simultaneous activation attempts for the same local principal', async () => {
    const session = {
      version: 1 as const,
      id: 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
    };

    await Promise.all([activateLocalGuestSession(session), activateLocalGuestSession(session)]);

    expect(mocks.getLocalGuestIdentity).toHaveBeenCalledTimes(1);
    expect(mocks.commitIdentityScopeSession).toHaveBeenCalledTimes(1);
  });
});
