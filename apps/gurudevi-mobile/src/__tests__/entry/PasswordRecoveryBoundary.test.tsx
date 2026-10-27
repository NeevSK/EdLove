import type React from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Session = { user: { id: string; is_anonymous?: boolean } };

const mocks = vi.hoisted(() => ({
  callback: null as ((event: string, session: Session | null) => void) | null,
  unsubscribe: vi.fn(),
  updatePassword: vi.fn(),
  getAuthSession: vi.fn(),
  listMfaFactors: vi.fn(),
  challengeAndVerifyTotp: vi.fn(),
  requestPasswordReauthentication: vi.fn(),
}));

vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      mocks.callback = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    },
    updatePassword: mocks.updatePassword,
    getAuthSession: mocks.getAuthSession,
    listMfaFactors: mocks.listMfaFactors,
    challengeAndVerifyTotp: mocks.challengeAndVerifyTotp,
    requestPasswordReauthentication: mocks.requestPasswordReauthentication,
  },
}));

vi.mock('@repo/ui/components/SanctuaryModal', () => ({
  default: ({
    children,
    isOpen,
    onClose,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <div {...{ onClose }}>{children}</div> : null),
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
  const session: Session = { user: { id: 'member-1', is_anonymous: false } };
  const factor = {
    id: 'totp-1',
    friendly_name: 'Personal authenticator',
    factor_type: 'totp',
    status: 'verified',
  };
  const mounted: ReturnType<typeof create>[] = [];
  const mount = async () => {
    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<PasswordRecoveryBoundary />);
    });
    mounted.push(tree);
    return tree;
  };
  const recover = async () => {
    const tree = await mount();
    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', session);
    });
    return tree;
  };
  const field = (tree: ReturnType<typeof create>, label: string) =>
    tree.root.findAllByType('input').find((node) => node.props.accessibilityLabel === label)!;
  const button = (tree: ReturnType<typeof create>, label: string) =>
    tree.root
      .findAllByType('button')
      .find((node) => node.findAllByType('span').some((span) => span.children.join('') === label))!;
  const press = async (tree: ReturnType<typeof create>, label: string) => {
    await act(async () => {
      button(tree, label).props.onPress();
    });
  };
  const draft = async (tree: ReturnType<typeof create>) => {
    await act(async () => {
      field(tree, 'New password').props.onChangeText('new-secure-password');
      field(tree, 'Confirm new password').props.onChangeText('new-secure-password');
      field(tree, 'Authenticator code').props.onChangeText('123456');
    });
    await press(tree, 'Load authenticators');
  };
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.callback = null;
    mocks.unsubscribe.mockReset();
    mocks.updatePassword.mockReset().mockResolvedValue({ user: { id: 'member-1' } });
    mocks.getAuthSession.mockResolvedValue(session);
    mocks.listMfaFactors.mockResolvedValue({ verified: [factor], all: [factor] });
    mocks.challengeAndVerifyTotp.mockResolvedValue({ user: session.user });
    mocks.requestPasswordReauthentication.mockResolvedValue(undefined);
  });
  afterEach(async () => {
    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });
  });

  it('only exposes password replacement after Supabase emits PASSWORD_RECOVERY', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<PasswordRecoveryBoundary />);
    });
    expect(tree!.root.findAllByType('input')).toHaveLength(0);

    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', session);
    });
    const inputs = tree!.root.findAllByType('input');
    expect(inputs).toHaveLength(5);

    await act(async () => {
      inputs[0]?.props.onChangeText('new-secure-password');
      inputs[1]?.props.onChangeText('new-secure-password');
      field(tree!, 'Authenticator code').props.onChangeText('123456');
    });
    await press(tree!, 'Load authenticators');
    await press(tree!, 'Save new password');

    expect(mocks.challengeAndVerifyTotp).toHaveBeenCalledWith('totp-1', '123456');
    expect(mocks.updatePassword).toHaveBeenCalledWith('new-secure-password', {
      expectedSubject: 'member-1',
    });
    expect(mocks.challengeAndVerifyTotp.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.updatePassword.mock.invocationCallOrder[0]!,
    );
    expect(tree!.root.findAllByType('input')).toHaveLength(0);
  });

  it('refuses a recovery event without a permanent Supabase session', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<PasswordRecoveryBoundary />);
    });

    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', { user: { id: 'guest', is_anonymous: true } });
    });
    expect(tree!.root.findAllByType('input')).toHaveLength(0);
  });

  it('forwards optional confirmations and lets the person select a verified authenticator', async () => {
    mocks.listMfaFactors.mockResolvedValue({
      verified: [factor, { ...factor, id: 'totp-2', friendly_name: 'Backup authenticator' }],
    });
    const tree = await recover();
    await draft(tree);
    await press(tree, 'Backup authenticator');
    await act(async () => {
      field(tree, 'Current password if required').props.onChangeText('old-secret');
      field(tree, 'Password confirmation code if required').props.onChangeText('654321');
    });
    await press(tree, 'Save new password');
    expect(mocks.challengeAndVerifyTotp).toHaveBeenCalledWith('totp-2', '123456');
    expect(mocks.updatePassword).toHaveBeenCalledWith('new-secure-password', {
      currentPassword: 'old-secret',
      nonce: '654321',
      expectedSubject: 'member-1',
    });
  });
  it('does not request a code automatically or infer password success from a code request', async () => {
    const tree = await recover();
    expect(mocks.requestPasswordReauthentication).not.toHaveBeenCalled();
    await press(tree, 'Request confirmation code');
    expect(mocks.requestPasswordReauthentication).toHaveBeenCalledTimes(1);
    expect(mocks.updatePassword).not.toHaveBeenCalled();
    expect(tree.root.findAllByType('input')).toHaveLength(5);
  });
  it.each(['factor', 'verify', 'password', 'delivery'])(
    'retains the draft on %s failure and never bypasses verification',
    async (stage) => {
      const tree = await recover();
      await draft(tree);
      if (stage === 'factor')
        mocks.listMfaFactors.mockRejectedValue(new Error('inventory unavailable'));
      if (stage === 'verify')
        mocks.challengeAndVerifyTotp.mockRejectedValue(new Error('code invalid'));
      if (stage === 'password')
        mocks.updatePassword.mockRejectedValue(new Error('confirmation required'));
      if (stage === 'delivery')
        mocks.requestPasswordReauthentication.mockRejectedValue(new Error('delivery unavailable'));
      await press(
        tree,
        stage === 'factor'
          ? 'Load authenticators'
          : stage === 'delivery'
            ? 'Request confirmation code'
            : 'Save new password',
      );
      expect(field(tree, 'New password').props.value).toBe('new-secure-password');
      expect(field(tree, 'Confirm new password').props.value).toBe('new-secure-password');
      if (stage !== 'password') expect(mocks.updatePassword).not.toHaveBeenCalled();
      expect(
        tree.root
          .findAllByType('span')
          .some((node) =>
            node.children.some(
              (value) => typeof value === 'string' && /unavailable|invalid|required/.test(value),
            ),
          ),
      ).toBe(true);
      if (stage === 'password') {
        mocks.updatePassword.mockResolvedValue({ user: session.user });
        await press(tree, 'Save new password');
        expect(mocks.updatePassword).toHaveBeenCalledTimes(2);
        expect(tree.root.findAllByType('input')).toHaveLength(0);
      }
    },
  );
  it('does not turn an empty verified-factor inventory into permission to save', async () => {
    mocks.listMfaFactors.mockResolvedValue({ verified: [], all: [] });
    const tree = await recover();
    await draft(tree);
    await press(tree, 'Save new password');
    expect(mocks.challengeAndVerifyTotp).not.toHaveBeenCalled();
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });
  it('invalidates an in-flight TOTP completion after account switching', async () => {
    let finish!: () => void;
    mocks.challengeAndVerifyTotp.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const tree = await recover();
    await draft(tree);
    await press(tree, 'Save new password');
    await act(async () => {
      mocks.callback?.('SIGNED_IN', { user: { id: 'member-2', is_anonymous: false } });
    });
    await act(async () => {
      finish();
    });
    expect(mocks.updatePassword).not.toHaveBeenCalled();
    expect(tree.root.findAllByType('input')).toHaveLength(0);
  });
  it('clears secrets on dismissal and ignores late results from an older recovery attempt', async () => {
    let finish!: () => void;
    mocks.updatePassword.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const tree = await recover();
    await draft(tree);
    await press(tree, 'Save new password');
    await act(async () => {
      tree.root.findByType('div').props.onClose();
    });
    expect(tree.root.findAllByType('input')).toHaveLength(0);
    await act(async () => {
      mocks.callback?.('PASSWORD_RECOVERY', session);
    });
    expect(field(tree, 'New password').props.value).toBe('');
    await act(async () => {
      field(tree, 'New password').props.onChangeText('new-attempt-draft');
      finish();
    });
    expect(field(tree, 'New password').props.value).toBe('new-attempt-draft');
  });
  it('denies a changed live session even if no auth callback arrived', async () => {
    const tree = await recover();
    await draft(tree);
    mocks.getAuthSession.mockResolvedValue({ user: { id: 'member-2', is_anonymous: false } });
    await press(tree, 'Save new password');
    expect(mocks.challengeAndVerifyTotp).not.toHaveBeenCalled();
    expect(mocks.updatePassword).not.toHaveBeenCalled();
    expect(tree.root.findAllByType('input')).toHaveLength(0);
  });
  it('clears the form and invalidates pending inventory after sign-out', async () => {
    let finish!: (value: { verified: (typeof factor)[] }) => void;
    mocks.listMfaFactors.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const tree = await recover();
    await press(tree, 'Load authenticators');
    await act(async () => {
      mocks.callback?.('SIGNED_OUT', null);
      finish({ verified: [factor] });
    });
    expect(tree.root.findAllByType('input')).toHaveLength(0);
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });
  it('ignores completion after unmount and unsubscribes its auth listener', async () => {
    let finish!: () => void;
    mocks.challengeAndVerifyTotp.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const tree = await recover();
    await draft(tree);
    await press(tree, 'Save new password');
    await act(async () => {
      tree.unmount();
      finish();
    });
    mounted.splice(mounted.indexOf(tree), 1);
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });
  it('blocks repeated saves synchronously while a verification is pending', async () => {
    let finish!: () => void;
    mocks.challengeAndVerifyTotp.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const tree = await recover();
    await draft(tree);
    await act(async () => {
      const save = button(tree, 'Save new password');
      save.props.onPress();
      save.props.onPress();
    });
    expect(mocks.challengeAndVerifyTotp).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
    });
    expect(mocks.updatePassword).toHaveBeenCalledTimes(1);
  });
});
