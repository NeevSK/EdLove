import { createElement } from 'react';
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
    lease: {
      startedAt: '2026-09-10T00:00:00.000Z',
      expiresAt: '2026-09-25T00:00:00.000Z',
      dismissedReminderDays: [],
    },
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

vi.mock('@repo/core/native/localGuestSession', () => ({
  isLocalGuestSessionId: (id: string) => id.startsWith('local-'),
}));

vi.mock('expo-router', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@repo/ui/components/native', () => ({
  Button: ({ label, ...rest }: { label: string }) =>
    createElement('Pressable', { accessibilityLabel: label, ...rest }),
  IconButton: ({ label, ...rest }: { label: string }) =>
    createElement('Pressable', { accessibilityLabel: label, ...rest }),
  Surface: 'Surface',
  Text: 'Text',
}));

vi.mock('@repo/ui/icons', () => ({ X: 'X' }));

import { GuestPersistenceNotice } from '@/entry/GuestPersistenceNotice';

describe('GuestPersistenceNotice (component-real)', () => {
  beforeEach(() => {
    mocks.user.id = 'guest-1';
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

  it('nudges a device-local guest without a countdown, and can be dismissed', async () => {
    mocks.user.id = 'local-123e4567-e89b-42d3-a456-426614174000';
    let tree;
    await act(async () => {
      tree = create(<GuestPersistenceNotice />);
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('saved on this device');
    expect(text).not.toContain('days left');
    const dismiss = tree!.root.findByProps({
      accessibilityLabel: 'Dismiss guest storage reminder',
    });
    await act(async () => {
      dismiss.props.onPress();
    });
    expect(tree!.toJSON()).toBeNull();
    mocks.user.id = 'guest-1';
  });
});
