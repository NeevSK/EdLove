import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const localGuestId = 'local-9ac0f584-4299-4b23-ae2c-5846be605c26';

const mocks = vi.hoisted(() => ({
  bindGuestConversionTarget: vi.fn(),
  clearGuestConversionRecord: vi.fn(),
  discardGuestConversion: vi.fn(),
  hasGuestData: vi.fn(),
  modalProps: null as Record<string, unknown> | null,
  readGuestConversionRecord: vi.fn(),
  session: {
    user: { id: 'account-1', is_anonymous: false },
  } as { user: { id: string; is_anonymous: boolean } } | null,
  user: { id: 'internal-account-1' } as { id: string } | null,
}));

vi.mock('@repo/core/logic', () => ({
  getSessionIdentityMode: (session: typeof mocks.session) =>
    session?.user.is_anonymous ? 'anonymous' : session ? 'authenticated' : 'unauthenticated',
  useAuth: () => ({
    resolvedAuthSubjectId: mocks.session?.user.id ?? null,
    session: mocks.session,
  }),
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: typeof mocks.user }) => unknown) =>
    selector({ user: mocks.user }),
}));
vi.mock('@repo/core/native', () => ({
  GuestDataSync: { hasGuestData: mocks.hasGuestData },
}));
vi.mock('@repo/core/native/guestConversionLedger', () => ({
  bindGuestConversionTarget: mocks.bindGuestConversionTarget,
  clearGuestConversionRecord: mocks.clearGuestConversionRecord,
  discardGuestConversion: mocks.discardGuestConversion,
  readGuestConversionRecord: mocks.readGuestConversionRecord,
}));
vi.mock('@repo/ui/components/GuestDataSyncModal', () => ({
  default: (props: Record<string, unknown>) => {
    mocks.modalProps = props;
    return null;
  },
}));

import { GuestConversionBoundary } from '@/entry/GuestConversionBoundary';

async function mountBoundary() {
  await act(async () => {
    create(<GuestConversionBoundary />);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('GuestConversionBoundary', () => {
  beforeEach(() => {
    mocks.modalProps = null;
    mocks.session = { user: { id: 'account-1', is_anonymous: false } };
    mocks.user = { id: 'internal-account-1' };
    mocks.bindGuestConversionTarget.mockReset().mockResolvedValue(undefined);
    mocks.clearGuestConversionRecord.mockReset().mockResolvedValue(undefined);
    mocks.discardGuestConversion.mockReset().mockResolvedValue(undefined);
    mocks.hasGuestData.mockReset().mockResolvedValue(true);
    mocks.readGuestConversionRecord.mockReset().mockResolvedValue({
      sourceGuestId: localGuestId,
      sourceKind: 'local-device',
      status: 'pending',
    });
  });

  it('recovers a device-local guest only after a confirmed durable subject exists', async () => {
    await mountBoundary();

    expect(mocks.bindGuestConversionTarget).toHaveBeenCalledWith(localGuestId, {
      id: 'account-1',
      is_anonymous: false,
    });
    expect(mocks.hasGuestData).toHaveBeenCalledWith(localGuestId);
    expect(mocks.modalProps).toMatchObject({
      isOpen: true,
      userId: 'internal-account-1',
    });
  });

  it('does not bind or expose a conversion choice for an anonymous session', async () => {
    mocks.session = { user: { id: 'anon-1', is_anonymous: true } };

    await mountBoundary();

    expect(mocks.bindGuestConversionTarget).not.toHaveBeenCalled();
    expect(mocks.hasGuestData).not.toHaveBeenCalled();
    expect(mocks.modalProps).toMatchObject({ isOpen: false });
  });

  it('keeps the payload recoverable when target binding is not authorized', async () => {
    mocks.bindGuestConversionTarget.mockRejectedValueOnce(
      new Error(
        'An existing-account transfer requires an explicit sign-in action from this guest source.',
      ),
    );

    await mountBoundary();

    expect(mocks.hasGuestData).not.toHaveBeenCalled();
    expect(mocks.modalProps).toMatchObject({ isOpen: false });
    expect(mocks.discardGuestConversion).not.toHaveBeenCalled();
    expect(mocks.clearGuestConversionRecord).not.toHaveBeenCalled();
  });
});
