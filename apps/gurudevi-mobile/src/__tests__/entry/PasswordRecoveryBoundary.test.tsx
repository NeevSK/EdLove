import type React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  callback: null as
    | ((event: string, session: { user: { is_anonymous?: boolean } } | null) => void)
    | null,
  unsubscribe: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    onAuthStateChange: (
      callback: (event: string, session: { user: { is_anonymous?: boolean } } | null) => void,
    ) => {
      mocks.callback = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    },
    updatePassword: mocks.updatePassword,
  },
}));

vi.mock('@repo/ui/components/SanctuaryModal', () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <>{children}</> : null,
}));

vi.mock('@repo/ui/primitives', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  ButtonSpinner: () => <span>saving</span>,
  ButtonText: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Input: ({ children }: React.PropsWithChildren) => <>{children}</>,
  InputField: (props: Record<string, unknown>) => <input {...props} />,
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  VStack: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

import { PasswordRecoveryBoundary } from '@/entry/PasswordRecoveryBoundary';

describe('PasswordRecoveryBoundary', () => {
  beforeEach(() => {
    mocks.callback = null;
    mocks.unsubscribe.mockReset();
    mocks.updatePassword.mockReset().mockResolvedValue({ user: { id: 'member-1' } });
  });

  it('only exposes password replacement after Supabase emits PASSWORD_RECOVERY', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<PasswordRecoveryBoundary />);
    });
    expect(tree!.root.findAllByType('input')).toHaveLength(0);

    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', { user: { is_anonymous: false } });
    });
    const inputs = tree!.root.findAllByType('input');
    expect(inputs).toHaveLength(2);

    await act(async () => {
      inputs[0]?.props.onChangeText('new-secure-password');
      inputs[1]?.props.onChangeText('new-secure-password');
    });
    await act(async () => {
      tree!.root.findByType('button').props.onPress();
    });

    expect(mocks.updatePassword).toHaveBeenCalledWith('new-secure-password');
    expect(tree!.root.findAllByType('input')).toHaveLength(0);
  });

  it('refuses a recovery event without a permanent Supabase session', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<PasswordRecoveryBoundary />);
    });

    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', { user: { is_anonymous: true } });
    });
    expect(tree!.root.findAllByType('input')).toHaveLength(0);
  });
});
