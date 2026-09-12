import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  user: { id: 'guest-1', is_anonymous: true, citizenship: 'THIRD_CLASS' },
  pathname: '/self',
  push: vi.fn(),
  lease: {
    day: 1,
    isExpired: false,
    reminderDay: 1,
    lease: { startedAt: '2026-09-10T00:00:00.000Z', expiresAt: '2026-09-25T00:00:00.000Z', dismissedReminderDays: [] },
  },
}));

interface GuestTestUser {
  id: string;
  is_anonymous: boolean;
  citizenship: string;
}

vi.mock('@repo/core/logic', () => ({
  isLocalOnlyIdentity: (user: GuestTestUser | null) => user?.citizenship === 'THIRD_CLASS',
}));

vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: GuestTestUser | null }) => unknown) =>
    selector({ user: mocks.user }),
}));

vi.mock('@repo/core/native', () => ({
  getOrCreateGuestLease: () => Promise.resolve(mocks.lease),
  dismissGuestLeaseReminder: vi.fn(() => Promise.resolve()),
}));

vi.mock('expo-router', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  Pressable: 'Pressable',
  Text: 'Text',
}));

import { GuestPersistenceNotice } from '@/entry/GuestPersistenceNotice';

describe('GuestPersistenceNotice (component-real)', () => {
  beforeEach(() => {
    mocks.pathname = '/self';
    mocks.push.mockClear();
  });

  it('explains local retention and routes guests to account creation', async () => {
    let tree;
    await act(async () => {
      tree = create(<GuestPersistenceNotice />);
    });

    expect(tree!.toJSON()).toBeTruthy();
    const button = tree!.root.findByProps({
      accessibilityLabel: 'Create an account to save across devices',
    });
    expect(button.props.accessibilityLabel).toContain('account');

    await act(async () => {
      button.props.onPress();
    });

    expect(mocks.push).toHaveBeenCalledWith('/auth');
  });

  it('does not duplicate the notice on entry routes', async () => {
    mocks.pathname = '/welcome';
    let tree;
    await act(async () => {
      tree = create(<GuestPersistenceNotice />);
    });

    expect(tree!.toJSON()).toBeNull();
  });
});
